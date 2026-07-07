$ErrorActionPreference = "Stop"

$blogRoot = ".\about\blog"
$files = Get-ChildItem $blogRoot -Recurse -Filter "index.html"

function Fix-VisibleBlogText($text) {
  if ([string]::IsNullOrWhiteSpace($text)) { return $text }

  $replacements = @{
    "you'n your" = "you're on your"
    "you'n" = "you're on"
    "you're on your computer" = "you're on your computer"
    "'onsive'responsive" = '"responsive". A responsive'
    "'onsive'the" = '"responsive" is the'
    "'esentation" = "presentation"
    "company'bsite" = "company's website"
    "company'rst" = "company's first"
    "visitor'rst" = "visitor's first"
    "they'se" = "they'll use"
    "aren'e" = "aren't"
    "It'eparate" = "It's a separate"
    "doesn'e" = "doesn't have"
    "doesn'have" = "doesn't have"
    "can'e" = "can't"
    "won'e" = "won't"
    "shouldn'e" = "shouldn't"
    "couldn'e" = "couldn't"
    "wouldn'e" = "wouldn't"
    "isn'e" = "isn't"
    "aren'e" = "aren't"
    "it'n" = "it's"
    "it s" = "it's"
    "can t" = "can't"
    "don t" = "don't"
    "doesn t" = "doesn't"
    "won t" = "won't"
    "shouldn t" = "shouldn't"
    "couldn t" = "couldn't"
    "wouldn t" = "wouldn't"
    "isn t" = "isn't"
    "aren t" = "aren't"
    "you re" = "you're"
    "we re" = "we're"
    "they re" = "they're"
    "visitor s" = "visitor's"
    "company s" = "company's"
    "customer s" = "customer's"
    "business s" = "business's"
    "website s" = "website's"
    "WebAct s" = "WebAct's"
    "multi-screens" = "multiple screens"
    "response website" = "responsive website"
    "response websites" = "responsive websites"
    "Read More Read More" = "Read More"
  }

  foreach ($key in $replacements.Keys) {
    $text = $text.Replace($key, $replacements[$key])
  }

  $text = $text -replace "\s+([,.!?;:])", '$1'
  $text = $text -replace "([.!?])([A-Z])", '$1 $2'
  $text = $text -replace "\s{2,}", " "

  return $text
}

foreach ($file in $files) {
  $path = $file.FullName
  $html = Get-Content $path -Raw

  # Fix text only between tags: > visible text <
  $html = [regex]::Replace($html, '(?<=>)([^<>]+)(?=<)', {
    param($m)
    Fix-VisibleBlogText $m.Value
  })

  # Fix alt/title attributes safely
  $html = [regex]::Replace($html, '(alt|title)="([^"]*)"', {
    param($m)
    $name = $m.Groups[1].Value
    $value = Fix-VisibleBlogText $m.Groups[2].Value
    return $name + '="' + $value + '"'
  })

  Set-Content $path $html -NoNewline -Encoding UTF8
}

git add about/blog
git commit -m "Safely repair blog post visible grammar"
git push origin main
