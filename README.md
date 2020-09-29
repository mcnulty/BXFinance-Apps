# BXFinance-Apps
Single page application (SPA) built with React; JSX, ECMAscript 2017, react-router, react-strap, SASS, JSON.

## Points of Interest
- All points of integration in the UI are tagged with Ping Integration comments. Depending on whether you are in pure ECMAScript or JSX the comment labels will be one of the following, 

> 1. Single line integration comment // Ping Integration ...
> 2. Multi-line integration comment /* Ping Integration ... */ 
> 3. JSX comment {/* Ping Integration ... */}

- Tech debt and other design concerns are tagged with **TODO** markers. Tech debt is managed and removed during sprints and will end up in future version releases. See "Recommended Extensions" list for TODO details. 
- 2 Dockerfiles:
There is one for the development environment build and another used for QA, staging, and production. The .env config file should be updated accordingly before running "docker build...". The Dev environment has its own DockerFile and Compose YAML file because we want a React "dev build" that allows for hot code reloading and volume mounted source for our development with VSCode Remote (recommended), or the IDE of your choice.
- 2 docker-compose.yaml files:
There is one for the development environment and another used for QA, staging, and production containers. The Dev environment has its own Compose YAML file because of the volumes needed for code editing, and some settings needed to support hot code reloading. The image definition's tag should be changed according to environment name... or whatever you named your images. 
- .env file:
This is the environment config file which contains a couple settings required for the app and integrations. This file is thoroughly commented.
- Ignore Files:

There are multiple ignore files so each build, run, and version tools don't pick up unnecessary artifacts that can be confusing and bloat the file system.
> 1. .npmignore for when running the dev version or building the prod version of the React code base.
> 2. .dockerignore for when executing Dockerfiles.
> 3. .gitignore for ignoring intentionally untracked files.

## Recommended VSCode Extensions
- Remote Development Extension Pack by Microsoft
- Babel Javascript by Michael McDermott
- ESLint by Dirk Baeumer
- Prettier - Code Formatter by Prettier
- env-cmd-file-syntax by Nixon
- nginx.conf hint by Liu Yue
- TODO Tree by Gruntfuggly
