$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path ".\assets\templates" -Force | Out-Null

@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{title}} | WebAct</title>
  <meta name="description" content="{{description}}">
</head>
<body>
  <div id="webact-header"></div>

  <main>
    <section class="wa-template-hero">
      <h1>{{title}}</h1>
      <p>{{description}}</p>
    </section>

    <section class="wa-template-content">
      {{content}}
    </section>
  </main>

  <div id="webact-footer"></div>

  <script src="/assets/js/routes.js"></script>
  <script src="/assets/js/navigation.js"></script>
  <script src="/assets/js/includes.js"></script>
</body>
</html>
'@ | Set-Content ".\assets\templates\landing-page.html" -NoNewline

Write-Host "Templates created." -ForegroundColor Green