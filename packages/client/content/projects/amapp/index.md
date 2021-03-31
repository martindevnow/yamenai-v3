---
title: AMApp - The AMA Tool
date: "2021-03-30T23:46:37.121Z"
description: How to quickly get to market. When is enough "enough"? Building an app to solve a problem, and prioritize getting it out and getting feedback over perfection.
draft: true
---

If you've been a part of internet culture for a while, or have stumbled across the pages of Reddit, you may have seen the subreddit or conversations with the term "AMA" or "r/IAmA". It's a subreddit which focuses on giving the audience an opportunity to "Ask Me Anything".

When I joined Thrillworks, they had a weekly (optional, but highly attended) meeting called an "AMA".

## Problem?

The problem, feedback/tough questions is hard to get from the audience on a zoom call.

The solution, build a simple tool that people can use to submit questions anonymously (if they choose), and even up-vote other questions to avoid repetition and show group alignment on a specific line of questioning.

## The Tool

I built a tool, called the "AMApp". We use it during these meetings. They are usually open a week ahead of time (to get ideas in early) and they are also recorded. We use the tool to track approx. what time the questions was answered so people can go to that timestamp in the recording, rather than trying to summarize what can sometimes be hard to put succinctly.

## What did I want to prove?

When faced with a problem:

- don't wait for someone else to fix it
- propose solutions
- try something different
- iterate quickly
- write clean code

## What I achieved

- Launched in sept, still in use in Apr 2021
- Low friction, (MS-SSO)
- had no designer, worked through feedback about simple UI decisions
- added darkmode
- leverages Firebase for realtime updates (and RxJS)
- ACL for roles
- Learned more about Firebase offerings, structuring data for privacy,
- Continue to work through TS and gotchas (themeGet / generics)

## Where it's going from here?

- focus on the value, the UX, ensure high adoption, quality of life improvements
- try out new features (WebRTC? Stream the zoom meeting after the fact (so it can be watched side by side))
- ideate on other ways we can gather feedback (hint at eNPS/Confidence Rating Slackbot)
