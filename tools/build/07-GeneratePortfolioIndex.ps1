$ErrorActionPreference = "Stop"

$dataPath = ".\assets\data\portfolio.json"
$outputPath = ".\about\portfolio.html"

$projects = Get-Content $dataPath -Raw | ConvertFrom-Json

$cards = foreach ($project in $projects) {
@"
      <article class="wa-portfolio-card" data-category="$($project.category)">
        <a href="$($project.url)">
          <div class="wa-portfolio-image">
            <img src="$($project.image)" alt="$($project.title)">
          </div>
          <div class="wa-portfolio-content">
            <span>$($project.category)</span>
            <h2>$($project.title)</h2>
            <p>$($project.description)</p>
          </div>
        </a>
        <a class="wa-portfolio-case-link" href="$($project.caseStudyUrl)">View Case Study</a>
      </article>
"@
}

$html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>WebAct Portfolio | Website Design & Digital Marketing Work</title>
  <meta name="description" content="View WebAct website design, SEO, advertising, ecommerce, and digital marketing portfolio projects.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="webact-header"></div>

  <main class="wa-portfolio-page">
    <section class="wa-portfolio-hero">
      <p class="wa-kicker">WebAct Portfolio</p>
      <h1>Website Design & Digital Marketing Portfolio</h1>
      <p>Explore WebAct website design, SEO, ecommerce, advertising, and digital marketing projects across industries.</p>
    </section>

    <section class="wa-portfolio-grid">
$($cards -join "`r`n")
    </section>
  </main>

  <div id="webact-footer"></div>

  <script src="/assets/js/routes.js"></script>
  <script src="/assets/js/navigation.js"></script>
  <script src="/assets/js/includes.js"></script>
</body>
</html>
"@

Set-Content $outputPath $html -NoNewline

Write-Host "Generated portfolio index: $outputPath" -ForegroundColor Green
Write-Host "Portfolio cards: $($projects.Count)" -ForegroundColor Cyan