---
title: Writing a Custom TSLint Rule From Scratch
date: "2018-12-11T22:12:03.284Z"
description: Use linting to enforce particular usage of an Angular directive. Building a custom TS lint rule will help your IDE identify mistakes before you even hit save. Catch mistakes sooner with a custom TSLint rule.
---

# Stopping Bad Code Before It Happens

## Problem: What We Want to Solve

So you've just written this super awesome directive for Angular that does _all the things_ and has _all the tests_. It's been committed, pushed and you've opened a Pull Request! All done! Awesome! High five! Woo!

You wake up the next morning and see code review comments start piling up. People who are reviewing your PR are trying to use the directive on tags that it doesn't support...

![Disappointed Developer](./01-andy-face-palm.gif)

But it's not a bug.. it's by design! Good luck explaining that to them.

So how can you ease their pain? Well, with Agile, we learn to "fail fast, fail often". The problem is that your fellow developers aren't realizing this mistake until they spend the time to build and run the app locally and visit the route where the directive was misused. If only we could identify this issue earlier in the development cycle with a friendly message, maybe they wouldn't be so angsty. If we could identify this before the build, that would save them quite a bit of time.

So, let's see what support we can provide with our directive to aid your colleagues.

## Problem: Breaking it Down

Before we code anything, let's explain in plain language what we are trying to identify as invalid code.

> In our example, our directive name is `myDirective`

We know that if the developer adds this directive to any of the following tags, that the directive will not work properly and will fail silently:

1. `<ng-container>`
2. `<ng-template>`
3. `<ng-content>`

These are the 3 use cases we need to look out for in our rule. Additionally, the directive could be added the following ways:

- `<ng-container myDirective="someString">`
- `<ng-container [myDirective]="someVariable">`

Let's brainstorm some ideas we can leverage to identify these usages.

## Solutions: Brainstorming

### 1. CSS Selectors to Limit Directive Selector

Angular allows us to be very specific using CSS selectors to limit which tags our directive will attach to. This is a potential solve to the problem of our directive being misused. We could change our directive as seen below.

The only issue here is that our directive will not be applied to tags that don't match our CSS selector, which is good, but the app will still build without showing any errors, and the developer won't see the functionality provided by `myDirective` and they won't immediately know why. This could send them on a tangent as they try to debug it.

```typescript
@Directive({
  // selector: '[myDirective]', // before
  selector: '*:not(ng-container):not(ng-template):not(ng-content)[myDirective]',
  // ...
})
```

### 2. CSS Selector for Negative Case

As an alternative, we could create an _error_ selector. This would be a _new_ directive with the same **attribute** selector as our real directive, but limited to the tags we do not support. This way it will only attach to our 3 unsupported tags. Then, when they are mounted, we could display an error to the developer in the page they are testing.

```typescript
import { Directive, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'ng-container[myDirective], ng-content[myDirective], ng-template[myDirective]'
})
export class MyDirectiveDirective implements OnInit {
  @Input('myDirective') myDirective: string;
  constructor() {}
  ngOnInit() {
    alert(`[${this.myDirective}]: myDirective cannot be applied to ng-container, ng-template, or ng-content');
  }
}
```

This solves the issue of failing silently. We now have something in the face of the developer. But what if this (somehow) makes it to production without thorough testing? Keep in mind that the application _still builds_ without any errors.

Maybe you don't have QAs on your team, or your CI/CD pipeline is lackluster. Regardless, having something like this in production wouldn't be good, no matter how slim the chance.

We could change the `alert` to a `console.error` but again, it's still potentially allowing bad code to be deployed. What we need is something that will call this out to the developer before the app is running.

## Solutions: Linting

> A **linter** refers to tools that analyze source code to flag programming errors, bugs, stylistic errors, and suspicious constructs.

Lint rules can come in many forms for numerous programming languages, but we're going to write a custom TSLint rule using some cool features of the Angular compiler to allow us to step through our code and inspect each component that we're concerned about.

This will allow us to quickly validate our code **before** building the app and **well before** manually testing our feature.

> **Note:** This should be a part of your team's Definition of Done or even built into automated processes such as a CI/CD pipeline or even simply a Git pre-push hook.

### Dependencies

In order to build our lint rule, we first need to add `tslint`, `codelyzer` and `typescript` as development dependencies for our project.

Run `npm install tslint codelyzer typescript --save-dev` to install these dependencies.

- `tslint` allows us to define our Rule class using their interfaces
- `codelyzer` allows us to use NgWalker which inspects the compiled angular AST (Abstract Syntax Tree) and steps through each piece of code and the AstVisitor allowing us to inspect each piece of code
- `typescript` allows us to type hint our SourceFile

> **Note:** When we actually run the tslint command, we will require either `tsc` or `ts-node` as dependencies

Next, we need to create a new file for our rule. TSLint specifies a few naming conventions that must be followed. In particular, your file must end in `...Rule.ts`.

> **Note:** `.js` or `.ts` are acceptable, but we will be using TypeScript for our custom Rule

Create a new folder for your custom rules. I created a folder `tslint-rules` in the project root (`./`). In that folder, I created a file `restrictMyDirectiveOnTagsRule.ts`.

Open this file and let's start coding our custom rule.

## Defining the Custom TSLint Rule

When defining a rule with TSLint, we need to specify various metadata about this rule. There are a few things to remember about specific conventions as seen in the [Documentation](https://palantir.github.io/tslint/develop/custom-rules/).

### Setting the Rule Metadata

- Rule Name identifiers are always kebab-cased.
- Rule files are always camel-cased (camelCasedRule.ts).
- Rule files must contain the suffix Rule.
- The exported class must always be named Rule and extend from Rules.AbstractRule.
- The metadata should match the interface as defined in (IRuleMetadata)

In your file `restrictMyDirectiveOnTagsRule.ts` add the following:

```typescript
import { IRuleMetadata, RuleFailure, Rules } from "tslint/lib"

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    ruleName: "restrict-my-directive-on-ng-tags",
    type: "maintainability",
    description: `Ensures that 'myDirective' is not applied to unsupported tags.`,
    options: null,
    optionsDescription: "Not configurable",
    rationale: `Applying 'myDirective' to unsupported tags will cause an error.`,
    typescriptOnly: true,
  }
}
```

Each field is described below:

- `ruleName` is the string that must be added to a `tslint.json` file for this rule to be added
- `description` is self explanatory
- `options` defines how you may configure this rule (Not Applicable, therefore `null`)
- `optionsDescription` describes how to configure the options
- `rationale` is why you should use this rule in your app
- `typescriptOnly` if false, it will also validate against `.js` files in your project

### Defining the Failure Message

In our `Rule` class, we need to define the failure message that the developer will see when our their code breaks our rule. Below our `metadata` definition, let's add the following:

`static readonly FAILURE_STRING = 'myDirective cannot be applied to the following tags: ng-container, ng-template and ng-content';`

We will use this error message whenever we find invalid code. This will be referenced from our visitor which will be defined in a later section.

### Applying the Rule to the Source Code

The last method to implement is the one to `apply` this rule against the source code being linted. It returns an array of lines of code that fail to pass our rule (`RuleFailure[]`).

In this method, we provide a new `NgWalker` to step through our source code. This is responsible for stepping through the Angular AST using the visitor defined in `MyDirectiveTemplateVisitor`. The visitor will receive the current node of the AST and the source code of that file.

In our visitor, we only need to override the methods applicable to our particular rule by targeting only specific types of AST objects.

This walker will inspect each node of our AST and run it against the methods in the visitor (based on the type of node being inspected). The visitor then builds the array of errors. The walker, once it has finished inspecting our source code, will return this array.

```ts
// ... below existing imports
import { SourceFile } from 'typescript/lib/typescript';
import { NgWalker } from 'codelyzer/angular/ngWalker';

// ... within the class definition
apply(sourceFile: SourceFile): RuleFailure[] {
  return this.applyWithWalker(new NgWalker(
    sourceFile,
    this.getOptions(),
    { templateVisitorCtrl: MyDirectiveTemplateVisitor }
  ));
}
// ...
```

Enough talk, let's build our visitor!

### Defining the AST Visitor

As we discussed, we only need to override methods that apply to our rule. As we mentioned, we only care about the three tags that myDirective doesn't support.

1. `<ng-container>`
2. `<ng-template>`
3. `<ng-content>`

These three tags represent three different type of AST node. Those are `ElementAst`, `EmbeddedTemplateAst`, and `NgContentAst` respectively.

This is what our class looks like stubbed out. The walker will provide the current node and source file to these methods when it inspects an AST node of matching type.

```ts
class MyDirectiveTemplateVisitor extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, context: BasicTemplateAstVisitor): any {}
  visitEmbeddedTemplate(
    ast: EmbeddedTemplateAst,
    context: BasicTemplateAstVisitor
  ): any {}
  visitNgContent(ast: NgContentAst, context: BasicTemplateAstVisitor): any {}
}
```

### Implementing Private Validation Methods

In each of the `visit` methods, we will need to validate the current AST node and source code. To do so, we can define some private methods that we will be able to reuse in our validation of these nodes.

#### `hasMyDirectiveInput` and `hasMyDirectiveAttr`

In our first two private methods, we validate whether there are any attributes or inputs and then filter to only attributes/inputs which match our directive's selector. If there are any, then we return `true`. If not, we return `false`.

```ts
private hasMyDirectiveAttr(ast: TemplateAst): boolean {
  return (
    !!ast.attrs.length &&
    !!ast.attrs.filter((attr: AttrAst) => attr.name === "myDirective").length
  );
}

private hasMyDirectiveInput(ast: TemplateAst): boolean {
  return (
    !!ast.inputs.length &&
    !!ast.inputs.filter(
      (input: BoundElementPropertyAst) => input.name === "myDirective"
    ).length
  );
}
```

#### `addSourceValidationError`

This method simply takes the information about the current node we're validating and adds information about the failure to the visitor using our predefined message.

```ts
private addSourceValidationError(ast: TemplateAst): void {
const {
sourceSpan: {
end: { offset: endOffset },
start: { offset: startOffset }
}
} = ast;
this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
}
```

> `endOffset` and `startOffset` are defined using [Object Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

We can now use this private method to add the failure message to the visitor.

#### `astHasRegexMatch`

This method simply tests if the AST node supplied matches the pattern provided.

First, we check whether the current source file contains the pattern supplied to the method. If it doesn't, then we know we're good, and return early.

If it _does_ contain our directive, there's a chance it is from a previous line of code that we've already added a failure for. This is because we just checked against the whole source file.

So, we take the substring based on the start and end of the tag we're validating and then run our check again. If the pattern is not found, we return `false`. If we find it, we return `true`.

```ts
private astHasRegexMatch(ast: TemplateAst, pattern: RegExp): boolean {
  if (!pattern.test(ast.sourceSpan.start.file.content)) {
    return false;
  }
  let onlyThisTag = ast.sourceSpan.start.file.content.slice(
    ast.sourceSpan.start.offset,
    ast.sourceSpan.end.offset
  );
  if (!pattern.test(onlyThisTag)) {
    return false;
  }
  return true;
}
```

We can now define the methods that will visit and validate each node of our AST.

## `ElementAst` (1. `<ng-container>`)

The `ElementAst` is a generic AST node that most HTML tags and Angular components resolve to when the compiler builds the AST. This also applies for our `<ng-container>` tag.

Our visitor will call this method whenever it encounters an AST node that implements the `ElementAst` interface. In our `visitElement` method, we will first call our private `validate` method.

In our `validateElement` method, we include the `ast.name === 'ng-container'` check because we only care about this type of `Element`.

> **Remember**: The directive could be applied either as `<my-component myDirective="15">` or as `<my-component [myDirective]="variable">`.

In one case, the Angular compiler will interpret this as an attribute on the tag. In the other case, as an input. So in our validate method, we call two private methods to see if either one exists. If either one exists, and it is `ng-container` then we call `addSourceValidationError`.

```ts
visitElement(ast: ElementAst, context: BasicTemplateAstVisitor): any {
  this.validateElement(ast, context);
  super.visitElement(ast, context);
}

private validateElement(
  ast: ElementAst,
  contest: BasicTemplateAstVisitor
): any {
  if (
    ast.name === "ng-container" &&
    (this.hasMyDirectiveAttr(ast) || this.hasMyDirectiveInput(ast))
  ) {
    this.addSourceValidationError(ast);
  }
}
```

## `EmbeddedTemplateAst` (2. `<ng-template>`)

Like above, our `visitEmbeddedTemplate` calls a `validate` method.

In our `validateEmbeddedTemplate` method, we can see we're not relying on the inputs and attributes methods as we did above.

This is because the `EmbeddedTemplateAst` interface doesn't have an `inputs` property (although it does have an `attrs` property.) Because of this, we're going to rely on regular expressions to determine whether or not our directive is being used on the current tag.

If the pattern matches, we once again call the addSourceValidationError method.

```ts
visitEmbeddedTemplate(
  ast: EmbeddedTemplateAst,
  context: BasicTemplateAstVisitor
): any {
  this.validateEmbeddedTemplate(ast, context);
  super.visitEmbeddedTemplate(ast, context);
}
private validateEmbeddedTemplate(
  ast: EmbeddedTemplateAst,
  context: BasicTemplateAstVisitor
): any {
  const pattern = /<ng-template(?:[\s\S]_?)\[?myDirective\]?=["']([\w\d]+)["'](?:[\s\S]_?)>/;
  if (this.astHasRegexMatch(ast, pattern)) {
    this.addSourceValidationError(ast);
  }
}
```

## `NgContentAst` (3. `<ng-content>`)

Finally, we need to validate against our `<ng-content>` which resolves to an `NgContentAst` node and has neither inputs nor attributes. Therefore, we will reuse our regex private method.

```ts
visitNgContent(ast: NgContentAst, context: BasicTemplateAstVisitor): any {
  this.validateNgContent(ast, context);
  super.visitNgContent(ast, context);
}

private validateNgContent(
  ast: NgContentAst,
  context: BasicTemplateAstVisitor
): any {
  const pattern = /<ng-content(?:[\s\S]_?)\[?myDirective\]?=["']([\w\d]+)["'](?:[\s\S]_?)>/;
  if (this.astHasRegexMatch(ast, pattern)) {
    this.addSourceFailure(ast);
  }
}
```

And that's pretty much it for writing our custom rule and our visitor to implement it, but we have one last step to hook up all the loose wiring.

## Configuring TSLint to Find our Custom TSLint Rule

We've registered our visitor with our custom rule, but we still haven't ensured that our current configuration of TSLint can find or use it.

In your project's root folder, you should find your `tslint.json` file. In here, we control the project specific settings.

If this file doesn't have a property `rulesDirectory`, then add it to the root level of the JSON object. In that array, you should add the path to the folder you created at the beginning of this article where you saved your new TSLint rule.

Secondly, in the rules object, you should add a new property that matches the `ruleName` you chose in your Rule's metadata and assign that property a value of `true`.

```json
{
  "rulesDirectory": [
    // ...
    "./tslint-rules"
  ],
  "rules": {
    // ...
    "restrict-my-directive-on-ng-tags": true
  }
}
```

## Running TSLint with our Custom TSLint Rule

To run TSLint normally, you can install TSLint globally and run `tslint --project ./` to run it against your current project. If you only installed it as a dependency for this project (in the steps above), run the following line. You should see the following error.

```
> ./node_modules/tslint/bin/tslint --project ./

Could not find implementations for the following rules specified in the configuration:
restrict-my-directive-on-ng-tags
```

This is because we wrote our rule in Typescript.

> **Note:** If you are running a version of TSLint < `v5.7.0` then you must first compile your rule (i.e. using `tsc`) to JavaScript before TSLint will be able to find your Rule.

We are using tslint > `v5.7.0` which can pickup `.ts` files though. However, we need to use `ts-node` to run `tslint`. If you don't have them installed, us `npm install ts-node --save-dev` and then run the following.

`./node\*modules/ts-node/dist/bin.js node_modules/.bin/tslint --project tsconfig.json "./src/\*\*/\_.ts"`

## Defining a New NPM Command

The last bonus step is to modify your `package.json` to add a new command you can run in your project to run linting and thus save your self many precious keypresses.

Add the following line to your `package.json`:

```json
"lint-ts": "./node_modules/ts-node/dist/bin.js node_modules/.bin/tslint --project tsconfig.json \"./src/**/*.ts\"",
```

You can now run `npm run lint-ts` to run your linting, including your new custom rule!

# Conclusion

Finally, we stage our files, make our commits and push it up confident that consumers of our directive will no longer be confused about where they can and cannot use it.

Of course, this is only scratching the surface of what is possible with linting. Sadly, there isn't a whole lot of documentation out there on writing your own TSLint rules, but hopefully this will get you off on the right foot.

Additionally, keep in mind the alternatives mentioned above using exclusionary selectors (selector: `'\*:not(ng-container):not(ng-template):not(ng-content)[myDirective]'`). It just depends on your use case.

![Thumbs Up Developer](./01-success-thumb-up.gif)

Good luck and happy linting!
