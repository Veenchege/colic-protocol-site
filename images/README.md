# Colic Protocol favicon package

Generated from mark.svg (not from the flattened PNGs, which had a solid cream
background baked in and no transparency).

## Files
- favicon.ico              multi-res (16/32/48), transparent — the actual tab icon, put in site root
- favicon-16.png / favicon-32.png / favicon-48.png / favicon-96.png   transparent, individual sizes
- favicon-192.png / favicon-512.png                                  transparent, general use
- android-chrome-192x192.png / android-chrome-512x512.png            same as above, Android-conventional names
- maskable-icon-192.png / maskable-icon-512.png     solid cream bg, mark shrunk to sit inside Android's safe zone so it survives being cropped to a circle or squircle
- apple-touch-icon.png (180x180)                    solid cream bg, slight padding — iOS never respects transparency here, so this MUST have a background fill or you get a black box on old iOS / a white box on some launchers

## HTML <head> tags
Paste this into colicprotocol.baby's <head>, replacing whatever favicon
tags exist now:

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#FBF3E7">

## site.webmanifest
Also included below. This is what lets someone add colicprotocol.baby to
their Android home screen with a proper adaptive icon instead of a
browser-generated placeholder.
