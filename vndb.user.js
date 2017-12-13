// ==UserScript==
// @name VNDB Autofill for AB Editors
// @version 1.0.0
// @author winneon
// @description Autofill VNDB information into torrent group pages to save time for AnimeBytes Editors.
// @namespace https://github.com/winneon
// @homepage https://github.com/winneon/ab-vndb-autofill
// @match *://animebytes.tv/torrents.php?action=editgroup&groupid=*
// @match *://vndb.org/v*/chars*?*abeditors=true*
// @match *://vndb.org/s*?*abeditors=true*
// @grant GM_openInTab
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_listValues
// @grant unsafeWindow
// @updateURL https://github.com/winneon/ab-vndb-autofill/raw/master/vndb.user.js
// ==/UserScript==

unsafeWindow._changePage = unsafeWindow.changePage

unsafeWindow.changePage = (type) => {
  let result = unsafeWindow._changePage(type)

  switch (type){
    case 'characters':
      waitUntil('input#update_characters').then(abInitial)
      break
  }

  return result
}

function waitUntil(selector){
  return new Promise((resolve, reject) => {
    let times = 0
    let delayInMs = 100

    let interval = setInterval(() => {
      if (document.querySelector(selector)){
        clearInterval(interval)
        resolve()
      } else {
        times = times + delayInMs

        if (times === 5000){
          clearInterval(interval)
          reject()
        }
      }
    }, delayInMs)
  })
}

function abInitial(){
  let element = document.querySelector('input#update_characters')
  let paste = document.createElement('input')
  let parent = element.parentNode

  paste.setAttribute('id', 'paste_from_vndb')
  paste.setAttribute('name', 'copy')
  paste.setAttribute('value', 'Copy from VNDB')
  paste.setAttribute('onclick', 'window.copyHandler()')
  paste.setAttribute('type', 'submit')
  paste.style.marginRight = '10px'

  parent.insertBefore(paste, element)
}

if (window.location.hostname === 'animebytes.tv' && window.location.search.startsWith('?action=editgroup&groupid=')){
  unsafeWindow.copyHandler = () => {
    let hyperlinks = document.querySelectorAll('div#info_links a')
    let vndb = ''

    for (element of hyperlinks){
      if (element.innerHTML === 'VNDB'){
        vndb = element.href
        break
      }
    }

    do {
      if (!vndb.includes('vndb.org/v')) {
        vndb = prompt('VNDB entry not found for this torrent group. Please enter the VNDB URL.')
      }
    } while (!vndb || !vndb.includes('vndb.org/v'))

    if (vndb){
      let element = document.querySelector('input#paste_from_vndb')

      element.setAttribute('name', 'paste')
      element.setAttribute('value', 'Paste from VNDB')
      element.setAttribute('onclick', 'window.pasteHandler()')

      GM_openInTab(vndb + '/chars?abeditors=true', false)
    }
  }

  unsafeWindow.pasteHandler = () => {
    let scraped = JSON.parse(GM_getValue('scraped'))

    for (character in scraped){
      let seiyuu = scraped[character]

      let innerHTML = `
<td>
  <input class="order" size="3" name="order[]" value="0" type="text" />
</td>
<td>
  <input class="character_name" size="30" name="character_name[]" value="${character}" type="text" />
</td>
<td id="seiyuu_name">
  <input class="seiyuu_name" size="30" name="seiyuu_name[]" value="${seiyuu}" type="text" />
</td>
<td>
  <center>
    <input class="deleteButton" name="submit" value="Delete" type="submit" />
  </center>
</td>
`

      let before = document.querySelector('tr#update_tr')
      let characterEdit = document.createElement('tr')
      let parent = before.parentNode

      characterEdit.className = 'characterEdit'
      characterEdit.innerHTML = innerHTML

      parent.insertBefore(characterEdit, before)

      document.querySelector('input#seiyuu[type="checkbox"]').setAttribute('checked', true)
      document.querySelector('input#character[type="checkbox"]').setAttribute('checked', true)
    }
  }

  switch (window.location.hash){
    case '#characters':
      waitUntil('input#update_characters').then(abInitial)
      break
  }
} else if (window.location.hostname === 'vndb.org' && window.location.pathname.includes('/chars') && window.location.search.includes('abeditors=true')){
  alert('The script is now going to begin scraping character names and seiyuu (last name, first name). Please do not interact with the window until the script tells you to.')

  let keys = document.querySelectorAll('div.mainbox > div.chardetails > table td.key')
  let hyperlinks = { }

  for (key of keys){
    if (key.innerHTML === 'Voiced by' && key.nextSibling){
      let character = key.parentNode.parentNode.parentNode.firstChild.firstChild.firstChild.firstChild.innerHTML
      hyperlinks[character] = key.nextSibling.firstChild.href
    }
  }

  GM_setValue('hyperlinks', JSON.stringify(hyperlinks))
  GM_setValue('scraped', JSON.stringify({ }))

  if (Object.keys(hyperlinks).length > 0){
    GM_openInTab(hyperlinks[Object.keys(hyperlinks)[0]] + '?abeditors=true', false)
  } else {
    alert('Looks like this torrent group doesn\'t have any voice-acted characters! Feel free to check the secondary checkbox in the verification tab for seiyuu and character listing.')
  }

  window.close()
} else if (window.location.hostname === 'vndb.org' && window.location.pathname.includes('/s') && window.location.search.includes('abeditors=true')){
  let hyperlinks = JSON.parse(GM_getValue('hyperlinks', '{}'))

  if (Object.keys(hyperlinks).length > 0){
    let scraped = JSON.parse(GM_getValue('scraped'))
    let seiyuu = document.querySelector('div.mainbox > h1').innerHTML

    scraped[Object.keys(hyperlinks)[0]] = seiyuu
    delete hyperlinks[Object.keys(hyperlinks)[0]]

    GM_setValue('hyperlinks', JSON.stringify(hyperlinks))
    GM_setValue('scraped', JSON.stringify(scraped))

    if (Object.keys(hyperlinks).length > 0){
      GM_openInTab(hyperlinks[Object.keys(hyperlinks)[0]] + '?abeditors=true', false)
      window.close()
    } else {
      alert('The script has completed scraping. Return to your original AnimeBytes tab and press the new "Paste from VNDB" button.')
      window.close()
    }
  } else {
    alert('The list of seiyuu links is empty. You shouldn\'t ever see this message... if you do, please let my creator know!')
  }
}
