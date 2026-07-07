$ErrorActionPreference = "Stop"

$blogRoot = ".\about\blog"
$files = Get-ChildItem $blogRoot -Recurse -Filter "index.html"

function Repair-VisibleText($text) {
  if ([string]::IsNullOrWhiteSpace($text)) { return $text }

  # Common phrase-level repairs caused by broken apostrophe transfer
  $text = $text -replace "Whether you'n your", "Whether you're on your"
  $text = $text -replace "Whether you'n", "Whether you're on"
  $text = $text -replace "you'n your", "you're on your"
  $text = $text -replace "you'n", "you're on"

  # Fix responsive quote damage
  $text = $text -replace "'onsive'responsive", '"responsive". A responsive'
  $text = $text -replace "'onsive' is the way", '"responsive" is the way'
  $text = $text -replace "'onsive'the way", '"responsive" is the way'
  $text = $text -replace "websites 'onsive'responsive", 'websites "responsive". A responsive'
  $text = $text -replace "websites 'onsive", 'websites "responsive"'

  # Fix common broken apostrophe endings
  $text = $text -replace "\bcompany'bsite\b", "company's website"
  $text = $text -replace "\bcompany'rst\b", "company's first"
  $text = $text -replace "\bvisitor'rst\b", "visitor's first"
  $text = $text -replace "\bIt'eparate\b", "It's a separate"
  $text = $text -replace "\bit'eparate\b", "it's a separate"
  $text = $text -replace "\bit'esentation\b", "its presentation"
  $text = $text -replace "\bdoesn'have\b", "doesn't have"

  # General contraction repair where apostrophe was replaced by space or broken letter
  $text = $text -replace "\bcan[ '\-]?t\b", "can't"
  $text = $text -replace "\bdon[ '\-]?t\b", "don't"
  $text = $text -replace "\bdoesn[ '\-]?t\b", "doesn't"
  $text = $text -replace "\bdidn[ '\-]?t\b", "didn't"
  $text = $text -replace "\bisn[ '\-]?t\b", "isn't"
  $text = $text -replace "\baren[ '\-]?t\b", "aren't"
  $text = $text -replace "\bwasn[ '\-]?t\b", "wasn't"
  $text = $text -replace "\bweren[ '\-]?t\b", "weren't"
  $text = $text -replace "\bwon[ '\-]?t\b", "won't"
  $text = $text -replace "\bshouldn[ '\-]?t\b", "shouldn't"
  $text = $text -replace "\bcouldn[ '\-]?t\b", "couldn't"
  $text = $text -replace "\bwouldn[ '\-]?t\b", "wouldn't"

  $text = $text -replace "\byou[ '\-]?re\b", "you're"
  $text = $text -replace "\bthey[ '\-]?re\b", "they're"
  $text = $text -replace "\bwe[ '\-]?re\b", "we're"
  $text = $text -replace "\bit[ '\-]?s\b", "it's"

  $text = $text -replace "\byou[ '\-]?ll\b", "you'll"
  $text = $text -replace "\bthey[ '\-]?ll\b", "they'll"
  $text = $text -replace "\bwe[ '\-]?ll\b", "we'll"
  $text = $text -replace "\bit[ '\-]?ll\b", "it'll"

  # Possessive repairs
  $text = $text -replace "\bcompany s\b", "company's"
  $text = $text -replace "\bcompanies s\b", "companies'"
  $text = $text -replace "\bcustomer s\b", "customer's"
  $text = $text -replace "\bcustomers s\b", "customers'"
  $text = $text -replace "\bbusiness s\b", "business's"
  $text = $text -replace "\bwebsite s\b", "website's"
  $text = $text -replace "\bvisitor s\b", "visitor's"
  $text = $text -replace "\buser s\b", "user's"
  $text = $text -replace "\bWebAct s\b", "WebAct's"

  # Common migration wording repairs
  $text = $text -replace "\bmulti-screens\b", "multiple screens"
  $text = $text -replace "\bresponse website\b", "responsive website"
  $text = $text -replace "\bresponse websites\b", "responsive websites"
  $text = $text -replace "\bresponse web design\b", "responsive web design"

  # Remove duplicate read more text
  $text = $text -replace "(?i)(Read More\s*){2,}", "Read More"

  # Clean punctuation spacing
  $text = $text -replace "\s+([,.!?;:])", '$1'
  $text = $text -replace "([.!?])([A-Z])", '$1 $2'
  $text = $text -replace "\s{2,}", " "

  return $text
}

foreach ($file in $files) {
  $path = $file.FullName
  $html = Get-Content $path -Raw

  # Only repair visible text between tags, not HTML/CSS/JS
  $html = [regex]::Replace($html, '(?<=>)([^<>]+)(?=<)', {
    param($m)
    Repair-VisibleText $m.Value
  })

  # Repair safe display attributes only
  $html = [regex]::Replace($html, '(alt|title)="([^"]*)"', {
    param($m)
    $name = $m.Groups[1].Value
    $value = Repair-VisibleText $m.Groups[2].Value
    return $name + '="' + $value + '"'
  })

  Set-Content $path $html -NoNewline -Encoding UTF8
}

git add about/blog
git commit -m "Repair blog post grammar patterns safely"
git push origin main
