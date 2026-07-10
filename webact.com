[33m219f3239[m Update Industries header navigation
[33m4bd737c5[m Update Industries navigation
[33me3e3d3c8[m Restore universal header include
[33m4b997f3d[m Apply universal header across site pages
[33m3a2c16a8[m Update navigation to embedded Widget Knowledge Base page
[33m6202c5ec[m Remove Widget Knowledge Base and link external source
[33m1b78958c[m Link About hub from mega menu
[33mb543f3ad[m Link Design hub from mega menu
[33ma828b988[m Link Marketing hub from mega menu
[33m9ddaa194[m Link digital advertising mega title
[33m6fe7ba82[m Restore working digital advertising page
[33md552c2c2[m Link digital advertising mega title to hub page
[33md160ab0e[m Fix Digital Advertising navigation and hero form
[33me1f04c33[m Link digital advertising hub and add hero form
[33mdd7e177d[m Link digital advertising hub in header
[33m70b1ad40[m Fix GitHub Pages image paths and footer encoding
[33m000f504b[m Fix main page header footer assets and navigation paths
[33m0dea164b[m Fix header logo path
[33m33974d23[m Convert core pages to universal header and footer includes
[33m678ed695[m Fix corrupted arrow symbols across pages
[33m24291447[m Fix header navigation targets
[33m9279181c[m Fix footer navigation targets
[33meadacd2f[m Set separate header and footer logos
[33m9941af18[m Restore original WebAct header and footer with updated site links
[33m3abc78e1[m Fix header footer logo paths and flat navigation links
[33mb1c8c236[m Restore original WebAct header and footer with full-width dropdowns
[33m6413f373[m Finalize universal header and footer deployment
[33ma9b61f0a[m Restore original navigation and footer with full width dropdowns
[33mdaf5602f[m Rebuild universal header with full-width Promodo navigation and site search
[33m2cddaddf[m Add universal header and footer across site
warning: in the working copy of 'pricing/marketing.html', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/pricing/marketing.html b/pricing/marketing.html[m
[1mindex 0932a6c2..8091b493 100644[m
[1m--- a/pricing/marketing.html[m
[1m+++ b/pricing/marketing.html[m
[36m@@ -533,7 +533,6 @@[m [mbody{[m
           <option>Google Business Profile</option>[m
           <option>Bing Places</option>[m
           <option>Local Listings</option>[m
[31m-          <option>Social Media Setup</option>[m
           <option>Complete Marketing Plan</option>[m
         </select>[m
       </label>[m
[36m@@ -555,15 +554,13 @@[m [mbody{[m
 [m
     <div class="pricing-intro">[m
       <p class="eyebrow">Local SEO Pricing</p>[m
[31m-[m
[31m-      <h2>Build local search visibility month after month.</h2>[m
[31m-[m
[32m+[m[32m      <h2>Build stronger visibility in the cities and communities you serve.</h2>[m
       <p>[m
[31m-        WebAct Local SEO plans combine keyword growth, city targeting, articles,[m
[31m-        website health reviews, local link building, keyword tracking, and[m
[31m-        ranking reports. Every plan is month-to-month with no contract.[m
[32m+[m[32m        WebAct Local SEO plans combine targeted keywords, city coverage,[m
[32m+[m[32m        industry-focused articles, website health reviews, link building,[m
[32m+[m[32m        keyword tracking, and monthly ranking reports. Every plan is[m
[32m+[m[32m        month-to-month with no contract.[m
       </p>[m
[31m-[m
       <a class="button primary" href="/webact-redesign/marketing/local-seo.html">[m
         Learn More About Local SEO[m
       </a>[m
[36m@@ -573,10 +570,12 @@[m [mbody{[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">01</span>[m
[31m-        <h3>Local SEO Standard</h3>[m
[31m-        <p class="tier-price">$1,200</p>[m
[32m+[m[32m        <h3>Local SEO Benchmark</h3>[m
[32m+[m[32m        <p class="tier-price">$500</p>[m
         <p class="tier-cycle">Per month · No contract</p>[m
[31m-        <p>Designed for new companies beginning to build local search visibility.</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for new companies beginning to build local search visibility.[m
[32m+[m[32m        </p>[m
         <ul>[m
           <li>1 new main keyword each month</li>[m
           <li>4 local towns or cities</li>[m
[36m@@ -590,10 +589,12 @@[m [mbody{[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">02</span>[m
[31m-        <h3>Local SEO Plus</h3>[m
[31m-        <p class="tier-price">$2,400</p>[m
[32m+[m[32m        <h3>Local SEO Exclusive</h3>[m
[32m+[m[32m        <p class="tier-price">$1,600</p>[m
         <p class="tier-cycle">Per month · No contract</p>[m
[31m-        <p>Designed for small companies targeting more services and local markets.</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for small companies targeting more services and local markets.[m
[32m+[m[32m        </p>[m
         <ul>[m
           <li>2 new main keywords each month</li>[m
           <li>5 local towns or cities per keyword</li>[m
[36m@@ -608,9 +609,11 @@[m [mbody{[m
       <article class="tier-card">[m
         <span class="tier-number">03</span>[m
         <h3>Local SEO Premium</h3>[m
[31m-        <p class="tier-price">$5,000</p>[m
[32m+[m[32m        <p class="tier-price">$3,000</p>[m
         <p class="tier-cycle">Per month · No contract</p>[m
[31m-        <p>Designed for companies requiring broader keyword and market coverage.</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for companies requiring broader keyword and market coverage.[m
[32m+[m[32m        </p>[m
         <ul>[m
           <li>4 new main keywords each month</li>[m
           <li>6 local towns or cities per keyword</li>[m
[36m@@ -630,45 +633,77 @@[m [mbody{[m
   <div class="pricing-feature">[m
 [m
     <div class="pricing-intro">[m
[31m-      <p class="eyebrow">PPC Advertising Pricing</p>[m
[31m-[m
[31m-      <h2>Launch paid advertising campaigns with clear management pricing.</h2>[m
[31m-[m
[32m+[m[32m      <p class="eyebrow">National SEO Pricing</p>[m
[32m+[m[32m      <h2>Expand search visibility beyond your local market.</h2>[m
       <p>[m
[31m-        WebAct PPC campaign management is priced per campaign, plus the advertising[m
[31m-        budget paid to the ad platform. Campaigns can include Google and Microsoft[m
[31m-        search, display, remarketing, video, shopping, and mobile advertising.[m
[32m+[m[32m        National SEO plans are designed for businesses competing across larger[m
[32m+[m[32m        geographic markets. Each plan combines keyword development, original[m
[32m+[m[32m        content, website reviews, link building, tracking, and ranking reports.[m
       </p>[m
[31m-[m
[31m-      <a class="button primary" href="/webact-redesign/pricing/advertising.html">[m
[31m-        View Advertising Pricing[m
[32m+[m[32m      <a class="button primary" href="/webact-redesign/marketing/national-seo.html">[m
[32m+[m[32m        Learn More About National SEO[m
       </a>[m
     </div>[m
 [m
[31m-    <div>[m
[31m-      <article class="tier-card" style="margin-bottom:20px">[m
[32m+[m[32m    <div class="tier-grid three">[m
[32m+[m
[32m+[m[32m      <article class="tier-card">[m
         <span class="tier-number">01</span>[m
[31m-        <h3>PPC Campaign Management</h3>[m
[31m-        <p class="tier-price">$300</p>[m
[31m-        <p class="tier-cycle">Per campaign + your advertising budget</p>[m
[32m+[m[32m        <h3>National SEO Benchmark</h3>[m
[32m+[m[32m        <p class="tier-price">$750</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · No contract</p>[m
         <p>[m
[31m-          Campaign setup and management pricing is separate from the amount spent[m
[31m-          directly with Google, Microsoft, or another advertising platform.[m
[32m+[m[32m          Designed for companies beginning to build national search visibility.[m
         </p>[m
[32m+[m[32m        <ul>[m
[32m+[m[32m          <li>3 new main keywords each month</li>[m
[32m+[m[32m          <li>3 new articles each month</li>[m
[32m+[m[32m          <li>Website health checkup</li>[m
[32m+[m[32m          <li>Link building</li>[m
[32m+[m[32m          <li>50-keyword tracker</li>[m
[32m+[m[32m          <li>Ranking reports</li>[m
[32m+[m[32m        </ul>[m
       </article>[m
 [m
[31m-      <div class="channel-grid">[m
[31m-        <article class="channel-card"><h3>Google Search Advertising</h3><p>Reach customers actively searching for your services or products.</p></article>[m
[31m-        <article class="channel-card"><h3>Google Display Advertising</h3><p>Build visibility across websites and digital placements.</p></article>[m
[31m-        <article class="channel-card"><h3>Google Remarketing</h3><p>Reconnect with people who previously visited your website.</p></article>[m
[31m-        <article class="channel-card"><h3>Google Video Advertising</h3><p>Promote your business with video campaigns and YouTube placements.</p></article>[m
[31m-        <article class="channel-card"><h3>Google Shopping Advertising</h3><p>Promote ecommerce products through product-focused search placements.</p></article>[m
[31m-        <article class="channel-card"><h3>Microsoft Search Ads</h3><p>Reach customers searching through Bing and Microsoft networks.</p></article>[m
[31m-        <article class="channel-card"><h3>Microsoft Shopping Ads</h3><p>Promote product listings through Microsoft shopping placements.</p></article>[m
[31m-        <article class="channel-card"><h3>Microsoft Mobile Ads</h3><p>Reach customers searching and browsing on mobile devices.</p></article>[m
[31m-      </div>[m
[31m-    </div>[m
[32m+[m[32m      <article class="tier-card">[m
[32m+[m[32m        <span class="tier-number">02</span>[m
[32m+[m[32m        <h3>National SEO Exclusive</h3>[m
[32m+[m[32m        <p class="tier-price">$1,800</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · No contract</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for national companies expanding their product and service[m
[32m+[m[32m          offerings.[m
[32m+[m[32m        </p>[m
[32m+[m[32m        <ul>[m
[32m+[m[32m          <li>8 new main keywords each month</li>[m
[32m+[m[32m          <li>8 new articles each month</li>[m
[32m+[m[32m          <li>Website checkup and audit</li>[m
[32m+[m[32m          <li>Link building</li>[m
[32m+[m[32m          <li>100-keyword tracker</li>[m
[32m+[m[32m          <li>Ranking reports</li>[m
[32m+[m[32m        </ul>[m
[32m+[m[32m      </article>[m
[32m+[m
[32m+[m[32m      <article class="tier-card">[m
[32m+[m[32m        <span class="tier-number">03</span>[m
[32m+[m[32m        <h3>National SEO Premium</h3>[m
[32m+[m[32m        <p class="tier-price">$3,500</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · No contract</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for large companies requiring broader keyword and market[m
[32m+[m[32m          coverage nationally.[m
[32m+[m[32m        </p>[m
[32m+[m[32m        <ul>[m
[32m+[m[32m          <li>20 new main keywords each month</li>[m
[32m+[m[32m          <li>20 new articles each month</li>[m
[32m+[m[32m          <li>Website checkup and audit</li>[m
[32m+[m[32m          <li>Link building</li>[m
[32m+[m[32m          <li>200-keyword tracker</li>[m
[32m+[m[32m          <li>Ranking reports</li>[m
[32m+[m[32m        </ul>[m
[32m+[m[32m      </article>[m
 [m
[32m+[m[32m    </div>[m
   </div>[m
 </section>[m
 [m
[36m@@ -676,18 +711,15 @@[m [mbody{[m
   <div class="pricing-feature">[m
 [m
     <div class="pricing-intro">[m
[31m-      <p class="eyebrow">Local Listings Pricing</p>[m
[31m-[m
[31m-      <h2>Keep your business information accurate across more than 100 listings.</h2>[m
[31m-[m
[32m+[m[32m      <p class="eyebrow">AEO Pricing</p>[m
[32m+[m[32m      <h2>Build visibility for AI search and answer platforms.</h2>[m
       <p>[m
[31m-        Choose self-managed access or let WebAct optimize, verify, enhance, and[m
[31m-        monitor your business listings. Pricing is monthly and applies to each[m
[31m-        business location.[m
[32m+[m[32m        Answer Engine Optimization helps organize your business information,[m
[32m+[m[32m        services, expertise, questions, and supporting content so AI-powered[m
[32m+[m[32m        search systems can better understand and reference your website.[m
       </p>[m
[31m-[m
[31m-      <a class="button primary" href="/webact-redesign/marketing/local-listings.html">[m
[31m-        Learn More About Listings[m
[32m+[m[32m      <a class="button primary" href="/webact-redesign/marketing/aeo.html">[m
[32m+[m[32m        Learn More About AEO[m
       </a>[m
     </div>[m
 [m
[36m@@ -695,51 +727,58 @@[m [mbody{[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">01</span>[m
[31m-        <h3>DIY Listings</h3>[m
[31m-        <p class="tier-price">$300</p>[m
[31m-        <p class="tier-cycle">Per month · Per location</p>[m
[31m-        <p>Designed for businesses that want access and prefer to manage their own listings.</p>[m
[32m+[m[32m        <h3>AEO SEO Benchmark</h3>[m
[32m+[m[32m        <p class="tier-price">$900</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · No contract</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for companies beginning to build visibility in AI-powered[m
[32m+[m[32m          search.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Optimize your own location</li>[m
[31m-          <li>Access to the listings platform</li>[m
[31m-          <li>Verify your own listings</li>[m
[31m-          <li>More than 100 listings</li>[m
[31m-          <li>Manage your own reviews</li>[m
[32m+[m[32m          <li>5 new main AEO articles each month</li>[m
[32m+[m[32m          <li>5 new SEO articles each month</li>[m
[32m+[m[32m          <li>Website health checkup</li>[m
[32m+[m[32m          <li>Link building</li>[m
[32m+[m[32m          <li>50-keyword tracker</li>[m
[32m+[m[32m          <li>Ranking reports</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">02</span>[m
[31m-        <h3>Managed Listings</h3>[m
[31m-        <p class="tier-price">$500</p>[m
[31m-        <p class="tier-cycle">Per month · Per location</p>[m
[31m-        <p>Designed for small companies that want WebAct to manage optimization.</p>[m
[32m+[m[32m        <h3>AEO SEO Exclusive</h3>[m
[32m+[m[32m        <p class="tier-price">$1,700</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · No contract</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for companies using AI search visibility to expand services[m
[32m+[m[32m          and products.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Location optimization</li>[m
[31m-          <li>Images and logo</li>[m
[31m-          <li>Products and services</li>[m
[31m-          <li>Verification of 100+ featured listings</li>[m
[31m-          <li>Team bios and images</li>[m
[31m-          <li>Featured message</li>[m
[31m-          <li>Monthly reports</li>[m
[32m+[m[32m          <li>10 new main AEO articles each month</li>[m
[32m+[m[32m          <li>10 new SEO articles each month</li>[m
[32m+[m[32m          <li>Website checkup and audit</li>[m
[32m+[m[32m          <li>Link building</li>[m
[32m+[m[32m          <li>100-keyword tracker</li>[m
[32m+[m[32m          <li>Ranking reports</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">03</span>[m
[31m-        <h3>Managed Listings Plus</h3>[m
[31m-        <p class="tier-price">$800</p>[m
[31m-        <p class="tier-cycle">Per month · Per location</p>[m
[31m-        <p>Designed for companies that also need review monitoring and response support.</p>[m
[32m+[m[32m        <h3>AEO SEO Premium</h3>[m
[32m+[m[32m        <p class="tier-price">$3,000</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · No contract</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Designed for large companies requiring broader market coverage and a[m
[32m+[m[32m          stronger presence in AI search results.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Location optimization</li>[m
[31m-          <li>Images and logo</li>[m
[31m-          <li>Products and services</li>[m
[31m-          <li>Verification of 100+ featured listings</li>[m
[31m-          <li>Team bios and images</li>[m
[31m-          <li>Featured message</li>[m
[31m-          <li>Monthly reports</li>[m
[31m-          <li>Review monitoring and response</li>[m
[32m+[m[32m          <li>20 new main AEO articles each month</li>[m
[32m+[m[32m          <li>20 new SEO articles each month</li>[m
[32m+[m[32m          <li>Website checkup and audit</li>[m
[32m+[m[32m          <li>Link building</li>[m
[32m+[m[32m          <li>200-keyword tracker</li>[m
[32m+[m[32m          <li>Ranking reports</li>[m
         </ul>[m
       </article>[m
 [m
[36m@@ -751,68 +790,70 @@[m [mbody{[m
   <div class="pricing-feature">[m
 [m
     <div class="pricing-intro">[m
[31m-      <p class="eyebrow">Answer Engine Optimization</p>[m
[31m-[m
[31m-      <h2>Prepare your website for AI-powered search and answer platforms.</h2>[m
[31m-[m
[32m+[m[32m      <p class="eyebrow">Local Listings Pricing</p>[m
[32m+[m[32m      <h2>Keep your business information accurate across more than 100 listings.</h2>[m
       <p>[m
[31m-        AEO pricing depends on the size of the website, number of services,[m
[31m-        industry complexity, content depth, existing SEO structure, and the number[m
[31m-        of pages requiring answer-focused optimization.[m
[32m+[m[32m        Choose self-managed access or let WebAct optimize, verify, enhance, and[m
[32m+[m[32m        monitor your listings. All listing plans are priced monthly for each[m
[32m+[m[32m        business location.[m
       </p>[m
[31m-[m
[31m-      <a class="button primary" href="/webact-redesign/marketing/aeo.html">[m
[31m-        Learn More About AEO[m
[32m+[m[32m      <a class="button primary" href="/webact-redesign/marketing/local-listings.html">[m
[32m+[m[32m        Learn More About Listings[m
       </a>[m
     </div>[m
 [m
[31m-    <div class="tier-grid">[m
[32m+[m[32m    <div class="tier-grid three">[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">01</span>[m
[31m-        <h3>AEO Foundation</h3>[m
[31m-        <p class="tier-price">Custom Pricing</p>[m
[31m-        <p class="tier-cycle">One-time or monthly scope</p>[m
[32m+[m[32m        <h3>DIY Listings</h3>[m
[32m+[m[32m        <p class="tier-price">$200</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · Per location</p>[m
[32m+[m[32m        <p>Perfect for new companies that want to manage their own listings.</p>[m
         <ul>[m
[31m-          <li>Question-based content review</li>[m
[31m-          <li>Business entity clarification</li>[m
[31m-          <li>Service and expertise summaries</li>[m
[31m-          <li>FAQ content structure</li>[m
[31m-          <li>Answer-ready page sections</li>[m
[32m+[m[32m          <li>Optimize your own location</li>[m
[32m+[m[32m          <li>Access to the platform</li>[m
[32m+[m[32m          <li>Verify your own listings</li>[m
[32m+[m[32m          <li>More than 100 listings</li>[m
[32m+[m[32m          <li>Manage your own reviews</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">02</span>[m
[31m-        <h3>Ongoing AEO and SEO</h3>[m
[31m-        <p class="tier-price">Custom Monthly Plan</p>[m
[31m-        <p class="tier-cycle">Based on website and market scope</p>[m
[32m+[m[32m        <h3>Managed Listings</h3>[m
[32m+[m[32m        <p class="tier-price">$500</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · Per location</p>[m
[32m+[m[32m        <p>Perfect for small companies that want WebAct to manage optimization.</p>[m
         <ul>[m
[31m-          <li>Ongoing question research</li>[m
[31m-          <li>New answer-focused content</li>[m
[31m-          <li>SEO and AEO alignment</li>[m
[31m-          <li>Industry and service expansion</li>[m
[31m-          <li>Content clarity improvements</li>[m
[32m+[m[32m          <li>Optimize your location</li>[m
[32m+[m[32m          <li>Images and logo</li>[m
[32m+[m[32m          <li>Products and services</li>[m
[32m+[m[32m          <li>Verify 100+ featured listings</li>[m
[32m+[m[32m          <li>Team bios and images</li>[m
[32m+[m[32m          <li>Featured message</li>[m
[32m+[m[32m          <li>Monthly reports</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">03</span>[m
[31m-        <h3>Structured Answers</h3>[m
[31m-        <p>[m
[31m-          Organize headings, summaries, services, supporting details, and FAQs[m
[31m-          into sections that are easier for search engines and AI systems to[m
[31m-          understand.[m
[31m-        </p>[m
[31m-      </article>[m
[31m-[m
[31m-      <article class="tier-card">[m
[31m-        <span class="tier-number">04</span>[m
[31m-        <h3>Clear Business Entities</h3>[m
[32m+[m[32m        <h3>Managed Listings Plus</h3>[m
[32m+[m[32m        <p class="tier-price">$1,200</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · Per location</p>[m
         <p>[m
[31m-          Clarify who the business is, what it offers, where it operates, and why[m
[31m-          it should be considered relevant and trustworthy.[m
[32m+[m[32m          Perfect for companies that need complete listings and review support.[m
         </p>[m
[32m+[m[32m        <ul>[m
[32m+[m[32m          <li>Optimize your location</li>[m
[32m+[m[32m          <li>Images and logo</li>[m
[32m+[m[32m          <li>Products and services</li>[m
[32m+[m[32m          <li>Verify 100+ featured listings</li>[m
[32m+[m[32m          <li>Team bios and images</li>[m
[32m+[m[32m          <li>Featured message</li>[m
[32m+[m[32m          <li>Monthly reports</li>[m
[32m+[m[32m          <li>Review monitoring and response</li>[m
[32m+[m[32m        </ul>[m
       </article>[m
 [m
     </div>[m
[36m@@ -823,76 +864,68 @@[m [mbody{[m
   <div class="pricing-feature">[m
 [m
     <div class="pricing-intro">[m
[31m-      <p class="eyebrow">Business Profiles</p>[m
[31m-[m
[31m-      <h2>Improve Google Business Profile and Bing Places visibility.</h2>[m
[31m-[m
[32m+[m[32m      <p class="eyebrow">Google My Business Pricing</p>[m
[32m+[m[32m      <h2>Improve your business visibility across Google Search and Maps.</h2>[m
       <p>[m
[31m-        WebAct offers one-time setup and ongoing management options for business[m
[31m-        profiles. Pricing depends on the number of locations, current profile[m
[31m-        condition, verification requirements, content needs, and management scope.[m
[32m+[m[32m        WebAct can optimize, verify, enhance, and manage your Google Business[m
[32m+[m[32m        Profile. Choose a one-time setup or ongoing monthly management with[m
[32m+[m[32m        advertising and reporting.[m
       </p>[m
[31m-[m
       <a class="button primary" href="/webact-redesign/marketing/gmb.html">[m
[31m-        View Business Profile Services[m
[32m+[m[32m        Learn More About Google Business Profile[m
       </a>[m
     </div>[m
 [m
[31m-    <div class="tier-grid">[m
[32m+[m[32m    <div class="tier-grid three">[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">01</span>[m
[31m-        <h3>Google Business Profile</h3>[m
[31m-        <p class="tier-price">Custom Pricing</p>[m
[31m-        <p class="tier-cycle">One-time setup or ongoing management</p>[m
[32m+[m[32m        <h3>Benchmark</h3>[m
[32m+[m[32m        <p class="tier-price">$500</p>[m
[32m+[m[32m        <p class="tier-cycle">One time · Per location</p>[m
[32m+[m[32m        <p>Perfect for new companies needing a professional profile setup.</p>[m
         <ul>[m
[31m-          <li>Business information review</li>[m
[31m-          <li>Category and service setup</li>[m
[31m-          <li>Profile optimization</li>[m
[31m-          <li>Images and business details</li>[m
[31m-          <li>Ongoing profile management options</li>[m
[32m+[m[32m          <li>Optimize location</li>[m
[32m+[m[32m          <li>Add images and logo</li>[m
[32m+[m[32m          <li>Add products and services</li>[m
[32m+[m[32m          <li>Verify listing</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">02</span>[m
[31m-        <h3>Bing Places</h3>[m
[31m-        <p class="tier-price">Custom Pricing</p>[m
[31m-        <p class="tier-cycle">One-time setup or ongoing management</p>[m
[32m+[m[32m        <h3>Business</h3>[m
[32m+[m[32m        <p class="tier-price">$750</p>[m
[32m+[m[32m        <p class="tier-cycle">One time · Per location</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Perfect for small companies that need profile setup and advertising[m
[32m+[m[32m          preparation.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Business information setup</li>[m
[31m-          <li>Location details</li>[m
[31m-          <li>Profile optimization</li>[m
[31m-          <li>Verification support</li>[m
[31m-          <li>Ongoing management options</li>[m
[32m+[m[32m          <li>Optimize location</li>[m
[32m+[m[32m          <li>Add images and logo</li>[m
[32m+[m[32m          <li>Add products and services</li>[m
[32m+[m[32m          <li>Verify listing</li>[m
[32m+[m[32m          <li>Set up Google Ads</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">03</span>[m
[31m-        <h3>Multi-Location Management</h3>[m
[31m-        <p class="tier-price">Custom Location Plan</p>[m
[31m-        <p class="tier-cycle">Based on number of locations</p>[m
[31m-        <ul>[m
[31m-          <li>Location-specific profile work</li>[m
[31m-          <li>Consistent business information</li>[m
[31m-          <li>Service and category alignment</li>[m
[31m-          <li>Local visibility coordination</li>[m
[31m-          <li>Reporting options</li>[m
[31m-        </ul>[m
[31m-      </article>[m
[31m-[m
[31m-      <article class="tier-card">[m
[31m-        <span class="tier-number">04</span>[m
[31m-        <h3>Profile and Listings Bundle</h3>[m
[31m-        <p class="tier-price">Custom Package</p>[m
[31m-        <p class="tier-cycle">Profile plus listings support</p>[m
[32m+[m[32m        <h3>Premium</h3>[m
[32m+[m[32m        <p class="tier-price">$1,000</p>[m
[32m+[m[32m        <p class="tier-cycle">Per month · Per location</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Perfect for companies that need ongoing profile and advertising[m
[32m+[m[32m          management.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Google profile support</li>[m
[31m-          <li>Bing Places support</li>[m
[31m-          <li>Local listings management</li>[m
[31m-          <li>Review signal coordination</li>[m
[31m-          <li>Local SEO alignment</li>[m
[32m+[m[32m          <li>Optimize location</li>[m
[32m+[m[32m          <li>Add images and logo</li>[m
[32m+[m[32m          <li>Add products and services</li>[m
[32m+[m[32m          <li>Verify listing</li>[m
[32m+[m[32m          <li>Manage Google Ads</li>[m
[32m+[m[32m          <li>Monthly report</li>[m
         </ul>[m
       </article>[m
 [m
[36m@@ -904,18 +937,15 @@[m [mbody{[m
   <div class="pricing-feature">[m
 [m
     <div class="pricing-intro">[m
[31m-      <p class="eyebrow">Social Media Setup</p>[m
[31m-[m
[31m-      <h2>Create professional social media business pages.</h2>[m
[31m-[m
[32m+[m[32m      <p class="eyebrow">Email Marketing Pricing</p>[m
[32m+[m[32m      <h2>Reach customers with professional email campaigns.</h2>[m
       <p>[m
[31m-        Social media setup pricing depends on the platforms selected, whether[m
[31m-        existing pages need cleanup, the amount of profile content required, and[m
[31m-        whether ongoing posting or management is included.[m
[32m+[m[32m        WebAct email marketing campaigns can support promotions, newsletters,[m
[32m+[m[32m        customer follow-up, announcements, new products, seasonal offers, and[m
[32m+[m[32m        lead nurturing.[m
       </p>[m
[31m-[m
[31m-      <a class="button primary" href="/webact-redesign/contact/index.html">[m
[31m-        Request Social Media Pricing[m
[32m+[m[32m      <a class="button primary" href="/webact-redesign/marketing/email-marketing.html">[m
[32m+[m[32m        Learn More About Email Marketing[m
       </a>[m
     </div>[m
 [m
[36m@@ -923,61 +953,79 @@[m [mbody{[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">01</span>[m
[31m-        <h3>Social Page Setup</h3>[m
[31m-        <p class="tier-price">Custom Pricing</p>[m
[32m+[m[32m        <h3>Email Campaign</h3>[m
[32m+[m[32m        <p class="tier-price">Starting at $500</p>[m
[32m+[m[32m        <p class="tier-cycle">Per campaign · Up to 2,500 contacts</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          A professionally planned email campaign for reaching customers,[m
[32m+[m[32m          prospects, or subscribers.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Business profile setup</li>[m
[31m-          <li>Logo and cover image placement</li>[m
[31m-          <li>Business descriptions</li>[m
[31m-          <li>Contact and website information</li>[m
[31m-          <li>Platform-specific profile details</li>[m
[32m+[m[32m          <li>Campaign planning</li>[m
[32m+[m[32m          <li>Email design and formatting</li>[m
[32m+[m[32m          <li>Campaign messaging</li>[m
[32m+[m[32m          <li>Up to 2,500 contacts</li>[m
[32m+[m[32m          <li>Call-to-action placement</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">02</span>[m
[31m-        <h3>Existing Page Optimization</h3>[m
[31m-        <p class="tier-price">Custom Pricing</p>[m
[32m+[m[32m        <h3>Ongoing Email Marketing</h3>[m
[32m+[m[32m        <p class="tier-price">Custom Monthly Plan</p>[m
[32m+[m[32m        <p class="tier-cycle">Based on frequency and contact volume</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Ongoing email communication for companies needing multiple campaigns,[m
[32m+[m[32m          newsletters, promotions, and customer follow-up.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Profile review</li>[m
[31m-          <li>Business information cleanup</li>[m
[31m-          <li>Brand consistency</li>[m
[31m-          <li>Link and contact corrections</li>[m
[31m-          <li>Content recommendations</li>[m
[32m+[m[32m          <li>Recurring campaign planning</li>[m
[32m+[m[32m          <li>Newsletter support</li>[m
[32m+[m[32m          <li>Promotional campaigns</li>[m
[32m+[m[32m          <li>Customer follow-up</li>[m
[32m+[m[32m          <li>Landing page coordination</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">03</span>[m
[31m-        <h3>Social Content Support</h3>[m
[31m-        <p class="tier-price">Custom Monthly Plan</p>[m
[32m+[m[32m        <h3>Additional Contacts</h3>[m
[32m+[m[32m        <p class="tier-price">Custom Pricing</p>[m
[32m+[m[32m        <p class="tier-cycle">For lists over 2,500 contacts</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Pricing is based on the number of contacts, email frequency, campaign[m
[32m+[m[32m          complexity, design needs, and required segmentation.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Post planning</li>[m
[31m-          <li>Promotional content</li>[m
[31m-          <li>Website and campaign coordination</li>[m
[31m-          <li>Graphic design support</li>[m
[31m-          <li>Ongoing content options</li>[m
[32m+[m[32m          <li>Larger contact lists</li>[m
[32m+[m[32m          <li>Audience segmentation</li>[m
[32m+[m[32m          <li>Multiple campaign types</li>[m
[32m+[m[32m          <li>Custom design requirements</li>[m
[32m+[m[32m          <li>Reporting options</li>[m
         </ul>[m
       </article>[m
 [m
       <article class="tier-card">[m
         <span class="tier-number">04</span>[m
[31m-        <h3>Social Advertising</h3>[m
[31m-        <p class="tier-price">Custom Campaign Plan</p>[m
[32m+[m[32m        <h3>Email and Website Integration</h3>[m
[32m+[m[32m        <p class="tier-price">Custom Package</p>[m
[32m+[m[32m        <p class="tier-cycle">Email plus landing-page support</p>[m
[32m+[m[32m        <p>[m
[32m+[m[32m          Connect campaigns to landing pages, forms, promotions, website content,[m
[32m+[m[32m          and conversion-focused customer journeys.[m
[32m+[m[32m        </p>[m
         <ul>[m
[31m-          <li>Audience targeting</li>[m
[31m-          <li>Campaign creative</li>[m
           <li>Landing page coordination</li>[m
[31m-          <li>Lead or traffic campaigns</li>[m
[31m-          <li>Performance review</li>[m
[32m+[m[32m          <li>Website form integration</li>[m
[32m+[m[32m          <li>Campaign graphics</li>[m
[32m+[m[32m          <li>Promotional content</li>[m
[32m+[m[32m          <li>Conversion path planning</li>[m
         </ul>[m
       </article>[m
 [m
     </div>[m
   </div>[m
[31m-</section>[m
[31m-[m
[31m-<section class="section soft">[m
[32m+[m[32m</section><section class="section soft">[m
   <div class="heading">[m
     <p class="eyebrow">Marketing Support</p>[m
     <h2>Connect every marketing service to your website and customer journey.</h2>[m
[36m@@ -1002,44 +1050,80 @@[m [mbody{[m
 <section class="section">[m
   <div class="heading">[m
     <p class="eyebrow">Marketing Pricing FAQ</p>[m
[31m-    <h2>Questions about SEO, listings, PPC, and AEO pricing.</h2>[m
[32m+[m[32m    <h2>Questions about SEO, AEO, listings, profiles, and email pricing.</h2>[m
   </div>[m
 [m
   <div class="faq-list">[m
[32m+[m
     <details open>[m
[31m-      <summary>Are Local SEO plans under contract?</summary>[m
[31m-      <p>No. The Local SEO Standard, Plus, and Premium plans are monthly plans with no contract.</p>[m
[32m+[m[32m      <summary>Are the SEO and AEO plans under contract?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        No. Local SEO, National SEO, and AEO plans are offered monthly with no[m
[32m+[m[32m        contract.[m
[32m+[m[32m      </p>[m
[32m+[m[32m    </details>[m
[32m+[m
[32m+[m[32m    <details>[m
[32m+[m[32m      <summary>What is included in Local SEO Benchmark?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        Local SEO Benchmark includes one new main keyword each month, four local[m
[32m+[m[32m        towns or cities, four new articles, a website health checkup, link[m
[32m+[m[32m        building, a 50-keyword tracker, and ranking reports.[m
[32m+[m[32m      </p>[m
     </details>[m
 [m
     <details>[m
[31m-      <summary>Is the advertising budget included in the $300 PPC price?</summary>[m
[31m-      <p>No. The $300 price is per campaign. Your advertising budget is paid separately to Google, Microsoft, or the selected advertising platform.</p>[m
[32m+[m[32m      <summary>What is included in National SEO Premium?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        National SEO Premium includes 20 new main keywords each month, 20 new[m
[32m+[m[32m        articles, a website checkup and audit, link building, a 200-keyword[m
[32m+[m[32m        tracker, and ranking reports.[m
[32m+[m[32m      </p>[m
     </details>[m
 [m
     <details>[m
[31m-      <summary>Are listings prices charged per location?</summary>[m
[31m-      <p>Yes. DIY Listings, Managed Listings, and Managed Listings Plus pricing is monthly and applies to each business location.</p>[m
[32m+[m[32m      <summary>How is AEO different from traditional SEO?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        Traditional SEO focuses on visibility in search-engine results. AEO also[m
[32m+[m[32m        structures content, questions, services, entities, and answers so[m
[32m+[m[32m        AI-powered search and answer platforms can better understand the website.[m
[32m+[m[32m      </p>[m
     </details>[m
 [m
     <details>[m
[31m-      <summary>What is included in Local SEO Standard?</summary>[m
[31m-      <p>Local SEO Standard includes one new main keyword, four local towns or cities, four new articles, a website health checkup, local link building, a 50-keyword tracker, and ranking reports each month.</p>[m
[32m+[m[32m      <summary>Are Local Listings plans priced per location?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        Yes. DIY Listings, Managed Listings, and Managed Listings Plus are[m
[32m+[m[32m        monthly plans priced separately for each business location.[m
[32m+[m[32m      </p>[m
     </details>[m
 [m
     <details>[m
[31m-      <summary>What is included in Managed Listings Plus?</summary>[m
[31m-      <p>Managed Listings Plus includes location optimization, images and logo, products and services, verification of more than 100 featured listings, team bios and images, a featured message, monthly reports, and review monitoring and response.</p>[m
[32m+[m[32m      <summary>Is Google My Business pricing monthly or one time?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        Benchmark and Business are one-time plans priced per location. Premium is[m
[32m+[m[32m        an ongoing monthly plan priced per location.[m
[32m+[m[32m      </p>[m
     </details>[m
 [m
     <details>[m
[31m-      <summary>How much does AEO cost?</summary>[m
[31m-      <p>AEO is custom priced because the scope depends on the number of pages, services, questions, locations, existing content, and whether work is one-time or ongoing.</p>[m
[32m+[m[32m      <summary>How much does email marketing cost?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        Email campaigns start at $500 per campaign for up to 2,500 contacts.[m
[32m+[m[32m        Larger contact lists, recurring campaigns, segmentation, and advanced[m
[32m+[m[32m        design requirements receive custom pricing.[m
[32m+[m[32m      </p>[m
     </details>[m
 [m
     <details>[m
[31m-      <summary>Can SEO, AEO, listings, and PPC be combined?</summary>[m
[31m-      <p>Yes. WebAct can create a custom plan combining search optimization, answer engine optimization, business profiles, listings, content, advertising, landing pages, and reporting.</p>[m
[32m+[m[32m      <summary>Can these services be combined?</summary>[m
[32m+[m[32m      <p>[m
[32m+[m[32m        Yes. WebAct can combine Local SEO, National SEO, AEO, listings, Google[m
[32m+[m[32m        Business Profile management, email marketing, website improvements, and[m
[32m+[m[32m        advertising into a custom plan.[m
[32m+[m[32m      </p>[m
     </details>[m
[32m+[m
   </div>[m
 </section>[m
 [m
