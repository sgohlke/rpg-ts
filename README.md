# rpg-ts

![Pipeline status](https://github.com/sgohlke/rpg-ts/workflows/RPG/badge.svg)

role play game application using Deno

## Requirements

This application needs a Deno version with Typescript 4.3 or higher. (i.e. Deno
v.1.11.0 or higher)

## Run

Only tests are currently running. Run **deno test** to execute.

## Lint

Run **deno lint** to execute.

## Code formatting

Code is formated using buildin **deno fmt** with the following options:

**deno fmt --options-indent-width=3 --options-single-quote**

## Code coverage

To collect code coverage from tests execute **deno test --coverage=covresults**
to create coverage results in covresults folder. Results can then be displayed
in pretty format calling **deno coverage covresults**.