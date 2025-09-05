# package-manager-proxy

A TypeScript CLI that automatically detects the package manager (pnpm, bun, npm, yarn, etc.) based on the current directory, and then forwards all CLI args to that package manager.

Note: This was made for my personal use, but should work for others too :)

## Install

1. Clone this repo
2. Install dependencies
3. Run the build script (it's just `tsc`) `npm run build` or `bun run build` or `yarn run build` or `pnpm run build` or `pm build` 😉
4. Link the project, `npm link` does the job.

That's it!

## Demo

### Install npm packages

This will install better-auth by using the package manager in your project

```bash
pm i better-auth
```


### Run scripts

Passing any argument that isn't an [alias](#custom-alias-scripts) or install command will automatically be treated as a script to be ran,
this will always be called with `<pm> run <arguments>`

```bash
pm build
```

Will become `npm run build`, or `bun run build`, or `yarn run build`, etc.

### Custom Alias scripts

As part of this repo, there is an `aslias.json`, which you can modify and add custom commands to.

By default, there is a `ba:docs` and possibly more, which is just for my personal use.

When running `pm` followed by an alias name, it will use the defined alias command prefixed with the package manager.

So something like this:
```json
{
    "ba:docs": "-F docs dev --port 3001"
}
```

ran with:
```bash
pm ba:docs
```

will become:

```bash
pnpm -F docs dev --port 3001
```

### Basic Info

If you just want basic info such as all of your active aliases or the current projects package manager, you can just run:

```bash
pm
```

Which will return something like this:

```
Package Manager: bun
┌─────────┬───────────────────────────┐
│ (index) │ Values                    │
├─────────┼───────────────────────────┤
│ ba:docs │ '-F docs dev --port 3001' │
└─────────┴───────────────────────────┘
```
