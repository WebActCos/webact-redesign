$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path ".\assets\templates" -Force | Out-Null

@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{title}} | WebAct</title>
  <meta name="description" content="{{description}}">
</head>
<body>
  <div id="webact-header"></div>

  <main>
    <section class="wa-template-hero">
      <p class="wa-template-kicker">{{kicker}}</p>
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

@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{title}} | WebAct Portfolio</title>
  <meta name="description" content="{{description}}">
</head>
<body>
  <div id="webact-header"></div>

  <main>
    <article class="wa-case-study">
      <p class="wa-template-kicker">Case Study</p>
      <h1>{{title}}</h1>
      <p>{{description}}</p>
      {{content}}
    </article>
  </main>

  <div id="webact-footer"></div>

  <script src="/assets/js/routes.js"></script>
  <script src="/assets/js/navigation.js"></script>
  <script src="/assets/js/includes.js"></script>
</body>
</html>
'@ | Set-Content ".\assets\templates\case-study.html" -NoNewline

Write-Host "Templates created." -ForegroundColor Green
