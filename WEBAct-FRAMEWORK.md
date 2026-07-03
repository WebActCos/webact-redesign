\# WebAct Framework



\## CSS Structure



\- css/styles.css: global variables, reset, typography, buttons, forms, utilities

\- css/layout.css: shared sections, containers, grids, spacing

\- css/navigation.css: header, navigation, mega menu, mobile nav

\- css/footer.css: footer only

\- css/components.css: reusable cards, CTAs, pricing, tabs, FAQs, testimonials

\- css/homepage.css: homepage-only styles

\- css/pages/\*.css: page-group styles



\## JS Structure



\- js/site.js: global behavior

\- js/navigation.js: navigation behavior

\- js/footer.js: footer behavior

\- js/pages/\*.js: page-specific behavior



\## Page Structure



All non-homepage pages live in /pages as flat HTML files.



Example:

\- pages/marketing.html

\- pages/marketing-local-seo.html

\- pages/digital-ads.html

\- pages/design.html

\- pages/pricing.html

\- pages/contact.html



\## Rule



Do not add new page-specific CSS to css/styles.css.

Add it to the correct section or page stylesheet.

