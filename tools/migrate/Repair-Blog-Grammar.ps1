$ErrorActionPreference = "Stop"

$blogRoot = ".\about\blog"
$files = Get-ChildItem $blogRoot -Recurse -Filter "index.html"

function Repair-BlogText($html) {
  # Fix common broken contractions and quote-damaged words
  $pairs = @(
    @("you'n", "you're on"),
    @("you re on", "you're on"),
    @("youre on", "you're on"),
    @("you'n your", "you're on your"),
    @("it'n", "it's"),
    @("it s", "it's"),
    @("doesn t", "doesn't"),
    @("don t", "don't"),
    @("can t", "can't"),
    @("won t", "won't"),
    @("shouldn t", "shouldn't"),
    @("couldn t", "couldn't"),
    @("wouldn t", "wouldn't"),
    @("isn t", "isn't"),
    @("aren t", "aren't"),
    @("they re", "they're"),
    @("we re", "we're"),
    @("you re", "you're"),
    @("visitor s", "visitor's"),
    @("company s", "company's"),
    @("customer s", "customer's"),
    @("business s", "business's"),
    @("website s", "website's"),
    @("user s", "user's"),
    @("WebAct s", "WebAct's"),
    @("responsive'", '"responsive"'),
    @("'responsive'", '"responsive"'),
    @("responsive web design sites", "responsive web design websites"),
    @("response website", "responsive website"),
    @("response websites", "responsive websites"),
    @("multi-screens", "multiple screens"),
    @("doesn'have", "doesn't have"),
    @("can'have", "can't have"),
    @("won'have", "won't have"),
    @("it'presentation", "its presentation"),
    @("they'll", "they'll")
  )

  foreach ($pair in $pairs) {
    $html = $html.Replace($pair[0], $pair[1])
  }

  # Fix broken punctuation patterns caused by earlier encoding replacements
  $html = $html -replace "\b([A-Za-z]+)'([A-Za-z]+)'", '$1''$2'
  $html = $html -replace "\s+([,.!?;:])", '$1'
  $html = $html -replace "([.!?])([A-Z])", '$1 $2'
  $html = $html -replace "\s{2,}", " "

  return $html
}

foreach ($file in $files) {
  $path = $file.FullName
  $html = Get-Content $path -Raw

  $html = Repair-BlogText $html

  Set-Content $path $html -NoNewline -Encoding UTF8
}

git add about/blog
git commit -m "Repair blog post grammar from encoding transfer"
git push origin main
