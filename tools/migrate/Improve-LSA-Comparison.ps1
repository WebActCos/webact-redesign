$ErrorActionPreference = "Stop"

$page = Get-Content ".\digital-ads\local-services-advertising.html" -Raw

#####################################################
# Fix comparison card colors
#####################################################

$css = @'

.lsa-comparison article{
    background:#ffffff;
    color:#071421;
}

.lsa-comparison article h3{
    color:#071421;
}

.lsa-comparison article p{
    color:#44525d;
}

.lsa-comparison article li{
    color:#44525d;
}

.lsa-comparison .comparison-buttons{
    display:flex;
    flex-wrap:wrap;
    gap:12px;
    margin-top:28px;
}

.lsa-comparison .comparison-buttons .button{
    flex:1;
    justify-content:center;
    text-align:center;
}

'@

$page = $page -replace '</style>',"$css`r`n</style>"

#####################################################
# Add buttons to Local Services Ads card
#####################################################

$page = $page -replace '(?s)(<h3>Local Services Ads</h3>.*?</ul>)','$1

<div class="comparison-buttons">
<a class="button primary" href="/webact-redesign/contact/index.html">Request LSA Review</a>

<a class="button secondary" href="/webact-redesign/pricing/advertising.html">Advertising Pricing</a>

<a class="button secondary" href="/webact-redesign/digital-ads/index.html">Digital Advertising Hub</a>
</div>
'

#####################################################
# Add buttons to Google Ads card
#####################################################

$page = $page -replace '(?s)(<h3>Google Search Ads</h3>.*?</ul>)','$1

<div class="comparison-buttons">
<a class="button primary" href="/webact-redesign/digital-ads/google-advertising.html">Learn Google Ads</a>

<a class="button secondary" href="/webact-redesign/pricing/advertising.html">Advertising Pricing</a>

<a class="button secondary" href="/webact-redesign/contact/index.html">Contact WebAct</a>
</div>
'

#####################################################

Set-Content ".\digital-ads\local-services-advertising.html" $page -Encoding UTF8

Write-Host ""
Write-Host "Comparison section upgraded." -ForegroundColor Green
Write-Host ""