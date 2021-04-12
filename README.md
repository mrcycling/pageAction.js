# visitorAction.js

All to often pop-ups and CTAs are triggered simply based on a visitor being on the page, without any regard to what their level of interest is.  Most of the time resulting in those items being subsequentially ignored.

The idea behind visitorAction.js is to determine what the visitor is doing browser side and then use that data to trigger appropriate pop-ups, highlight CTAs and record interest.

## Functions

The first portion of the code is tracking scroll movements as well as pauses.  We are particularly interested in the pauses, as they indicate that the visitor has slowed down a bit to examine that section in more detail (or maybe went to get another coffee :wink:).

The second section records total time on the page, total number of pauses and even cummulative time for websites employing page hydration rather than page reloads.  These can be used to determine if the page / product was of interest to the visitor or if they were simply clicking through the choices.

The last section looks at individual divs, such as product description, calulates the number of words within, figures out approxomately how much time is needed to read and how many pauses are likely during that reading.  It can be set to **"read"** for someone reading every word or to **"skim"** if your visitors are more likely to skim through the info, but still be interested. Checking both the elapsed time and total pasues against the estimates gives a general idea if the visitor read the content.

## Potential

This project is in its initial conception phase and more info will be added.  We are developing it primarily to highlight a CTA on the product page if there is interest and also to trigger mailing list sign up pop-up, also based on interest.

Could be used to create "products viewed" menu that shows just the products the visitor took the time to read, rather than a list of all.

## To Do

A more robust reading estimator, that looks at div dimensions, including padding, font size, line height and browser viewport to more accurately determine how much shows at a time within the viewport and more accurately calculate the potential number of pauses need to read through.

