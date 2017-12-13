# VNDB Autofill for AB Editors

This userscript autofills VNDB information into visual novel torrent group pages to save time for AnimeBytes Editors. That's about it. It's really only useful for AnimeBytes Editors, not many others. This is only on GitHub so I have someplace to store the update script.

## Installation

This userscript supports the majority of the major browsers and userscript extensions. To install it, just open [the userscript](https://github.com/winneon/ab-vndb-autofill/raw/master/vndb.user.js) in a new tab; the extension should detect it and bring up an installation menu. See below for a complete list of supported software.

### Firefox 57+, Google Chrome, Vivaldi

* Violentmonkey (recommended)
* Greasemonkey (Firefox only, version 4.0+ required)
* Tampermonkey

### Firefox 56 and prior, Firefox forks (Pale Moon, etc.)

All of these are untested. If you use this userscript with one of the above browsers and it works with any of the below extensions, please let me know and I'll update this README.

* Greasemonkey (Firefox only, recommended)
* Violentmonkey
* Tampermonkey

## FAQ

### Who don't you use VNDB's API instead of using a scraper?

VNDB's API first requires you to be logged into their service in order to actually use it. That's a big no-no right out of the gate. On top of that, there's a limit of ~200 calls to the API a day per account, which is another big no-no. That's why.

### Why does the script open a new tab for every single voiced character?

This is because of the way VNDB is structured and how the eroge industry works in Japan. The vast majority of eroge seiyuu will list themselves in the credits under a pen name. This could be for a variety of reasons, although the most common one is that they're voicing porn characters, and they don't want their actual name to be stamped next to that.

As for the tabs, VNDB lists who voices each character under the VN's listing page, but that's their pen name. To see who *actually* voiced that character, you have to open seiyuu's listing page. There really isn't any other way to go about fixing that without using VNDB's API, which for reasons explained above, isn't happening.

### Okay then, how do I automatically close the bajillion tabs it opens?

The userscript should automatically close these tabs on Google Chrome and Vivaldi. On Firefox however, you need to go into your `about:config` and edit the `dom.allow_scripts_to_close_windows` value to `true`. That should allow the script to close the tab without the browser yelling at the poor thing.
