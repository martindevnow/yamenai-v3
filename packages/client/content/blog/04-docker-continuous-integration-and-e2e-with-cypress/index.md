---
title: "Docker Full Circle: Continuous Integration (CI) with Cypress"
date: "2019-06-25T23:46:37.121Z"
description: Learning Docker gives you greater flexibility in CICD pipelines. Continuous Integration tools like Circle CI and Jenkins can run your pipeline in a Docker container. Using our custom Dockerfiles, we build a container for your app, and one for the Cypress test runner to run end-to-end (e2e) tests against your application.
---

You're at work and your team has adopted Docker for development. That's great! Everyone is using your custom Docker image to manage dependencies and any other environment requirements. You've _nearly_ made it look just like your production environment. High five!

![Million High Fives](./04-high-five.gif)

Fast forward to the end of the sprint and you're all clamouring to get in your features, but you have yet to hand off your work to QA... again. It always ends up that the last day or two of the sprint, you hand off all of your tickets to QA and just wait for your ticket to be closed off. If you are a QA and you're reading this, I apologize for having contributed to this trend.

But what if I told you there’s a better way? Hopefully, the empathy you have for your QA on your team would encourage you to keep reading. And if you don't have a QA, then I **implore** you to continue.

> **Note:** This article is a continuation of my series about Docker. You can read it here: [Custom Docker Images for Development](https://benjaminmartin.dev/03-docker-creating-custom-docker-images/)

## CI: Continuous Integration

Continuous integration is the concept of regularly committing code to the main branch of your app's repository as opposed to having numerous long lived branches where large features are built and only merged once these large features are considered complete.

However, making many small isolated code check-in (commits) to the mainline (develop or master branch) of your application can be nerve racking if you don't have the proper checks and balances in place to ensure that you don't accidentally break your app, (or, if you do, that you catch these breaking changes early and fast).

In this article, we'll look at building a continuous integration pipeline that will automatically ensure our code passes code linting, unit tests, build step, and even end-to-end (E2E) tests. This pipeline will use CircleCI to monitor your code in GitHub. When it detects an update, it will pull your code and then use Docker to execute validation steps that we configure. If everything passes, our production Docker image will be published to Docker Hub (our Docker image repository) or to a private docker repository.

## Prerequisites

We'll be covering a lot of topics to setup the entire pipeline, including Docker, GitHub, CircleCI, Cypress, and Docker Hub. Below I outline some basic setup and knowledge that will make this easier to follow and understand.

### Docker

In this article, we're going to look at CI/CD pipelines with CircleCI and we're going to use a modified version of the Docker image from the previous article about [Custom Docker Images for Development](https://benjaminmartin.dev/03-docker-creating-custom-docker-images/). **Some knowledge of Docker is required. However, instead of using Docker for development, we will build a "production ready" Docker image to run E2E tests against.**

### Cypress

Cypress is the E2E test runner that we will configure in our CI pipeline. We won't discuss writing E2E tests in this article. **We will only modify the default Cypress config that VueCLI sets up our project with.** We will also add an e2e step in our CircleCI configuration. No previous Cypress knowledge is required.

### VueCLI

Our app is the default app created by VueCLI ([@vue/cli](https://www.npmjs.com/package/@vue/cli)). You can run `vue create docker-demo` to create a new Vue Project.

![Vue CLI Create Project](./vue-cli.gif "Vue CLI Create Demo Project")

### GitHub

The CI pipeline will connect to your GitHub repository. You will need a GitHub account. Create your repository in GitHub and push your project.

### Connecting CircleCI to GitHub

**You will need to configure CircleCI to connect to your GitHub account.** [There is great documentation on that to get you started](https://circleci.com/docs/2.0/getting-started/). It would be beneficial if you have some understanding of CircleCI and how YAML is structured. We will be going over some more intermediate techniques using CircleCI at the end of this article.

### Docker Hub

At the end of the article, we will connect CircleCI with Docker Hub and then `publish` the Docker image to a remote repository as the final step of our CI pipeline. This is to ensure that the same image we tested is being persisted. We use the same image for deploying to QA/production. This way, we avoid rebuilding this image on a different machine which could introduce some variance in the final built asset. **Ensure you have an account with Docker Hub**. Otherwise, you can publish to your Docker repository of choice.

## Configuring Docker for "Production"

Our app is the default app created by VueCLI. We selected Cypress as the E2E testing library, but we'll need to change a little bit about how it works by default to be more efficient with our Docker container management. But, before we setup Cypress, let's look at the `Dockerfile` responsible for building the "production ready" version of our app.

Create a `Dockerfile` in your project's root and use this content:

```docker
# Builder
FROM node:9.11.1 as builder
COPY package*.json /tmp/
RUN cd /tmp && CI=true npm install

WORKDIR /usr/src/app
COPY . /usr/src/app/
ENV NODE_ENV=production
RUN cp -a /tmp/node_modules /usr/src/app/ && npm run build

# Make production build
FROM node:9.11.1 as prodBuild
RUN npm install -g http-server-ssl http-server
WORKDIR /app
COPY --from=builder /usr/src/app/dist .
EXPOSE 80
EXPOSE 443
CMD [ "http-server-ssl", "-p", "443", "-S", "/app" ]
```

You should notice a few things different from our development `Dockerfile.dev`. [Please use this `Dockerfile.dev` in your project.](https://gist.github.com/martindevnow/b1fa01f45bc60649396dc450acf2996b) It was slightly updated from the previous blog post to also use multistage builds which are described below. It will be used in our CI pipeline to run unit tests.

### Multistage Builds

This time, we have 2 `FROM` statements which are aliased with the `as` keyword. This allows us to use what are called "Multistage Builds".

> **Note:** Docker's multistage builds requires Docker v17.05 or later. [_More documentation can be found here._](https://docs.docker.com/develop/develop-images/multistage-build/)

In a nutshell, it enables us to slim down our final images, and keeps all the logic to do so in a single `Dockerfile`. Here are some changes to note:

1. Each new `FROM` line defines a new stage.
2. Name you stages (`as ....`). This is how you will reference them later in your `Dockerfile`
3. You can use `--from` in the `COPY` command to pull built assets from earlier stages.
4. `--from` can also target completely different images (either local or from a linked repo)
5. Running `docker build` will build the entire `Dockerfile` (down to the last stage defined) by default
6. You can stop at a specific stage with `docker build --target stageName`

The `builder` stage has all of our dependencies, including development dependencies. This is because we require the `vue-cli-service` (which is a development dependency) to build our final `dist/` folder. At the end, we just need an `http-server` to host our static files, because we don't have a node server running. The `prodBuild` stage then only needs to copy the `dist/` folder from our `builder` stage and setup the `http-server`.

Now that we have that setup, let's also setup our Cypress server.

## Cypress in Docker

We've taken all this time to optimize our Docker image for our production application. In order to keep our production image clean, we don't want to include test utils or other libraries that are only used for testing in our production image. Instead, we will isolate Cypress into its own Docker image.

With that in mind, create a new folder in the root of your project named `cypress/`. In that folder, create a file `package.json`, `cypress.json`, and `Dockerfile.cypress`.

### Cypress Dependencies :: `package.json`

Here we can see what the actual dependencies for running a stand-alone Cypress instance looks like. We have our tests from our main project, and we install Cypress in this Docker image.

```json
{
  "name": "e2e",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "directories": {
    "test": "tests"
  },
  "devDependencies": {
    "cypress": "^3.1.2"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### Cypress Configuration :: `cypress.json`

Our cypress configuration only points to the plugins which are the defaults your VueCLI generated project will come with.

```json
{
  "browser": "chrome",
  "pluginsFile": "tests/e2e/plugins/index.js"
}
```

> **Note:** If you used VueCLI to build your project, and you selected Cypress for E2E tests in the CLI, you will have `@vue/cli-plugin-e2e-cypress` as a dependency in your main `package.json`.

> This package is no longer necessary, as we will be running our Cypress tests from a separate container.
> This makes it faster to install development dependencies in our main `Dockerfile` (in the root of the project) since we don't need Cypress in our development image either.

> **Run the following two commands in the root of your project** > `npm uninstall --save-dev @vue/cli-plugin-e2e-cypress` > `npm install --save-dev eslint-plugin-cypress`

### Cypress Docker Image :: `Dockerfile.cypress`

Here's the content for the `Dockerfile.cypress`

```docker
FROM cypress/base:8 as e2eBuild

# Copy NPM & Install
COPY ./cypress/package.json /tmp/package.json
RUN cd /tmp && CI=true npm install
RUN CI=true /tmp/node_modules/.bin/cypress install
RUN mkdir -p /e2e && cp -a /tmp/node_modules /e2e/

WORKDIR /e2e
# Copy files for config
COPY ./cypress/cypress.json /e2e

# Run tests
CMD ["./node_modules/.bin/cypress", "run" ]
```

> **Note:** `CI=true` is used to suppress an exorbitant amount of verbose console outputs during the cypress installation

Similar to what we've done with our app's `Dockerfile`, we first copy our `package.json`, install dependencies and move those dependencies to our working directory. We don't copy in our tests, because we will eventually be running these tests in a CI environment, and that environment will be pulling our code repository, so instead we will use a volume to mount the tests into the container. This will be managed with `docker-compose`.

## Orchestrating Multiple Containers with Docker Compose

Using Docker Compose is a great way to convert most of the `docker` command line arguments into configuration in your YML file. Additionally, we can create multiple containers and even alias them and reference them in the configuration for other containers. Let's make a `docker-compose.yml` file in the root of our project using the following configuration:

```docker-compose
version: '3.2'
services:
  web:
    image: YOUR_DOCKER_HUB_ACCOUNT/${IMAGE_NAME}:${TAG}
    tty: true
    environment:
      - NODE_ENV=production
    command: >
      http-server -p 80 /app
  cypress:
    command: >
      ./node_modules/.bin/cypress run
    depends_on:
      - web
    environment:
      - TAG=${TAG}
      - IMAGE_NAME=${IMAGE_NAME}
      - CYPRESS_baseUrl=http://web:80/
      - CYPRESS_browser=chrome
      - CYPRESS_screenshotsFolder=/results/${TAG}/screenshots
      - CYPRESS_videosFolder=/results/${TAG}/videos
    build:
      context: .
      # target: e2eBuild    # Supported in v3.4 of Docker-Compose
      dockerfile: ./cypress/Dockerfile.cypress
    volumes:
      - type: bind
        source: ./results
        target: /results
      - type: bind
        source: ./tests
        target: /e2e/tests
```

In our `docker-compose.yml` file, we specify two services that will run together; `web` and `cypress`. _Web_ will be running the production version of our app on a simple HTTP server, and _cypress_ will be running our Cypress tests.

> **Note:** If you used VueCLI to install cypress as the e2e provider when you setup your project, you will need to comment out the two lines in `/tests/e2e/plugins/index.js` which set the `screenshotsFolder` and the `videosFolder`.
> We will instead be using the `docker-compose.yml` file to set these folders, allowing us to easily use environment variables in the paths depending on the environment variable `TAG`.

#### Inputs / Environment Vars for Production

As you can see in our `docker-compose.yml` file, we expect several environment variables to be set in order for this file to work properly. The `IMAGE_NAME` and `TAG` are required for the `web` service to start up. We can supply these inline when we run our `docker-compose up` command.

The important thing to note here is that `web` relies on having an existing image to run. We don't want to rebuild our docker image when we run compose. The advantage of using docker is to make sure we use the exact same copy in our tests as we use in production. Therefore, if you want to test your `docker-compose` locally, you need to first build the prod image as shown in the following section.

## Building Production

Run the following command in the root of your project to build your production image.
`docker build -t YOUR_DOCKER_HUB_ACCOUNT/docker_demo:latest -f Dockerfile .`

After running that, run:
`IMAGE_NAME=docker_demo TAG=latest docker-compose build cypress`

followed by:

`IMAGE_NAME=docker_demo TAG=latest docker-compose up --abort-on-container-exit`

Assuming that you have all passing tests, it should run, pass and then close and remove the Docker container for you.

If you look into your project, there will be a video of the test runner in the project root's `/results/latest/videos` folder. Open it up and see the glorious success!

## Setting up CI Pipeline

> **Note:** If you haven't already, as per the prerequisites section above, create a repo for your code in GitHub, push it up, and connect your account to CircleCI.

### Using NPM to run our Commands

In order to make our CircleCI config cleaner and to allow our developers to easily run our various docker commands in the terminal, we will alias them to `npm run ...` commands. Here are the custom `scripts` we will add to our `package.json`.

```json
    ...,
    "test:lint-unit": "npm run lint && npm run test:unit",
    "comment:local": "# === Development Commands === #",
    "build:dev": "docker build --target devBuild -t YOUR_DOCKER_HUB_ACCOUNT/${npm_package_name}_dev:latest -f Dockerfile.dev .",
    "start:dev": "docker rm mdn_${npm_package_name}_dev_container || true && docker run --rm -it -p 8085:8085 --mount type=bind,src=`pwd`,dst=/usr/src/app -v /usr/src/app/node_modules --name mdn_${npm_package_name}_dev_container YOUR_DOCKER_HUB_ACCOUNT/${npm_package_name}_dev:latest npm run serve",
    "start:unit": "docker exec -it mdn_${npm_package_name}_dev_container npm run test:unit",

    "comment:prod": "# === Production Commands === #",
    "build:prod": "docker build -t YOUR_DOCKER_HUB_ACCOUNT/${npm_package_name}:${TAG:=latest} -f Dockerfile .",

    "comment:cci": "# === CircleCI Commands === #",
    "build:ci": "docker build --target ciBuild -t YOUR_DOCKER_HUB_ACCOUNT/${npm_package_name}_ci:latest -f Dockerfile.dev .",
    "start:ci": "docker run --rm YOUR_DOCKER_HUB_ACCOUNT/${npm_package_name}_ci:latest npm run test:lint-unit",

    "comment:e2e": "# === e2e Testing Command === #",
    "build:cypress": "IMAGE_NAME=${npm_package_name} TAG=${TAG:=latest} docker-compose build cypress",
    "start:cypress": "IMAGE_NAME=${npm_package_name} TAG=${TAG:=latest} docker-compose up --abort-on-container-exit",
    ...
```

> **Note:** The comments are only for logical separation to make it easier to read.

> **Important: The `name` in your `package.json` must match your `$IMAGE_NAME` environment variable we use below.** I used `docker_demo` in these examples, so the `name` in my `package.json` is also `docker_demo`

## CircleCI Configuration

Create a new folder in your project root named `.circleci/` and create a file within it called `config.yml` with the following content:

```yaml
defaults: &defaults
  machine:
    docker_layer_caching: true

version: 2.1
commands:
  setupenv:
    description: "Simple command to Setup Environment Variables"
    steps:
      - checkout
      - run:
          name: Setup Environment Variables
          command: |
            echo 'export TAG=${CIRCLE_SHA1}' >> $BASH_ENV
            echo 'export IMAGE_NAME=docker_demo' >> $BASH_ENV
  cache-app:
    description: "Cache the Production Docker Image"
    parameters:
      cache:
        type: boolean
        default: false
    steps:
      - when:
          condition: <<parameters.cache>>
          steps:
            - run:
                name: Save Docker Image
                command: |
                  mkdir -p docker-cache
                  docker save -o docker-cache/built-image.tar YOUR_DOCKER_HUB_ACCOUNT/$IMAGE_NAME:$TAG
            - save_cache:
                key: docker_cache_key-{{ .Environment.CIRCLE_SHA1 }}
                paths:
                  - docker-cache

# Job Definition List
jobs:
  unit-test:
    <<: *defaults
    steps:
      - setupenv
      - run:
          name: Lint & Unit Test Application
          command: |
            npm run build:ci
            npm run start:ci

  build:
    <<: *defaults
    steps:
      - setupenv
      - run:
          name: Build Production Docker Image
          command: |
            npm run build:prod

  build-and-cache:
    <<: *defaults
    steps:
      - setupenv
      - run:
          name: Build Production Docker Image
          command: |
            npm run build:prod
      - cache-app:
          cache: true

  acceptance-test:
    <<: *defaults
    steps:
      - setupenv
      - restore_cache:
          key: docker_cache_key-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Load Image from Docker Cache
          command: |
            docker load < docker-cache/built-image.tar
      - run:
          name: Run End-to-End Tests
          command: |
            mkdir -p ./results/$TAG/screenshots ./results/$TAG/videos
            npm run build:cypress
            npm run start:cypress
      - store_artifacts:
          path: ./results

  publish:
    <<: *defaults
    steps:
      - setupenv
      - restore_cache:
          key: docker_cache_key-{{ .Environment.CIRCLE_SHA1 }}
      - run:
          name: Load Image from Docker Cache
          command: |
            docker load < docker-cache/built-image.tar
      - run:
          name: Publish Docker Image
          command: |
            echo $DOCKER_PWD | docker login -u $DOCKER_LOGIN --password-stdin
            docker push YOUR_DOCKER_HUB_ACCOUNT/$IMAGE_NAME:$TAG

workflows:
  version: 2.1
  build-test-acceptance-publish:
    jobs:
      - unit-test
      - build:
          requires:
            - unit-test
          filters:
            branches:
              ignore:
                - develop
                - master
      - build-and-cache:
          requires:
            - unit-test
          filters:
            branches:
              only:
                - develop
                - master
      - acceptance-test:
          requires:
            - build-and-cache
          filters:
            branches:
              only:
                - develop
                - master
      - publish:
          requires:
            - acceptance-test
          filters:
            branches:
              only:
                - develop
                - master
```

In our `config.yml` file above, we define 3 top level categories of `commands`, `jobs` and `workflows`.

### Commands, Jobs and Workflows

**Commands** are reusable snippets of configuration that can be reused throughout our CI pipeline definition. They can even accept parameters.

Here are the two commands we defined above:

- `setupenv` will setup our environment by pulling the code that is being run through the pipeline, and setting the relevant environment variables to be used by our `package.json` commands.
- `cache-app` helps us cache the built image to a tar file and preserve it in CircleCI to be used in a later step.

**Jobs** are a series of steps that can be leveraged in our workflows (explained below). In our code above, we define the following jobs:

- `unit-test` run unit tests, and ensure they're all passing
- `build` ensure the build doesn't fail
- `build-and-cache` same as above, but will cache the prodBuild to be used in the `acceptance-test`
- `acceptance-test` runs our e2e tests in cypress
- `publish` pushes our docker images to Docker Hub that successfully pass all the above steps

**Workflows** are a sequence of jobs that can be filtered and run against your code depending on how the filters are configured. In this project, we have only one workflow that will run sequentially. Some of the jobs in the workflow also have a `requires` property which specifies which jobs are required to have passed successfully before the job can run.

Basically, we have two main flows, one that will be applied to the branches: `develop` and `master` and the second flow which is applied to all other branches.

- `develop` and `master` will first execute `unit-test` followed by `build-and-cache`, then `acceptance-test` and finally `publish`. If any of these jobs fail, the workflow will halt and the build will have failed. CircleCI will then send a notification to people subscribed to the project.
- All other branches will only have `unit-test` and `build` run against the code. This is a cost savings measure since we pay for runtime used on CircleCI. This allows for fast feedback and also speeds up the continuous integration pipeline since any subsequent steps could be run in parallel.

### Anchors

YAML allows declaring a node as an anchor. This means this node will be referred to somewhere later in the YAML. We use this feature of YAML to avoid repeating the first 3 lines in each of the jobs that we define. You can [read more about anchors here.](https://circleci.com/blog/circleci-hacks-reuse-yaml-in-your-circleci-config-with-yaml/)

### Cache and Artifacts

These are two cool features that we leverage in our CircleCI config: **artifacts** (used to preserve the screenshots and videos that Cypress will generate for us to view in the CircleCI webapp) and **cache** which we use to preserve some assets between jobs. This way we can leverage our built docker images between the `build-and-cache` and `acceptance-test` without having to publish it to a remote repository as an intermediary step.

### Publishing

In our final step, we publish the image to a docker repository. In our case, we're using docker hub.

Here are the environment variables we need to set in CircleCI:

- `DOCKER_LOGIN` :: Your Docker Hub username
- `DOCKER_PWD` :: Your Docker Hub password

These need to be set as project specific environment variables inside of CircleCI's project settings. [This is covered in their documentation found here.](https://circleci.com/docs/2.0/env-vars/#setting-an-environment-variable-in-a-project)

## Enhancements

All of this is to say, this is only one way to accomplish the goal of testing our code automatically as new code is pushed to our repository. Here are a few ways this could be improved.

- Change from publishing to Docker Hub to AWS ECR in order to have private Docker repositories
- Use the same builder for `ci` and `prod`. The initial step for running unit tests installs development dependencies. So does the builder in the prod build Dockerfile. We could avoid installing dependencies twice by leveraging a single image that is built from the builder stage for both the unit-tested version and the prod builder version.

If you have your own ideas on how to improve this CI pipeline, reach out to me on Twitter [@martindevnow](https://twitter.com/martindevnow) and share your thoughts!
