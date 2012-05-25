//= require "../chrome/esc"

var $startingpoint = $('#startingpoint').click(function (event) {
  event.preventDefault();
  if (localStorage) {
    analytics.saveTemplate();
    localStorage.setItem('saved-javascript', editors.javascript.getCode());
    localStorage.setItem('saved-html', editors.html.getCode());
    $startingpoint.addClass('saved');
    $('#tip p').html('Default starting point now changed to current code');
    $html.addClass('showtip');
  }
  return false;
});

var $revert = $('#revert').click(function () {
  if ($revert.is(':not(.enable)')) {
    return false;
  }

  var key = '', i = 0;
  for (; i < sessionStorage.length; i++) {
    key = sessionStorage.key(i);
    if (key.indexOf('jsbin.content.') === 0) {
      sessionStorage.removeItem(key);
    }
  }

  for (key in editors) {
    editors[key].populateEditor();
  }

  analytics.revert();

  // editors.javascript.focus();
  $('#library').val('none');
  
  if (window.gist != undefined) {
    gist.setCode();
  }

  $document.trigger('codeChange', [ { revert: true } ]);

  return false;
});

$('#loginbtn').click(function () {
  analytics.login();
  $('#login').show();
  loginVisible = true;
  $username.focus();
  return false;
});

$('#logout').click(function (event) {
  event.preventDefault();

  // We submit a form here because I can't work out how to style the button
  // element in the form to look the same as the anchor. Ideally we would
  // remove that and just let the form submit itself...
  $(this).siblings('form').submit();
});

$('.homebtn').click(function () {
  analytics.open();
  jsbin.panels.hideAll();
  return false;
});

var dropdownOpen = false,
    onhover = false,
    menuDown = false;

function opendropdown(el) {
  if (!dropdownOpen) {
    $(el).closest('.menu').addClass('open');
    dropdownOpen = true;
  }
}

function closedropdown() {
  menuDown = false;
  if (dropdownOpen) {
    dropdownButtons.closest('.menu').removeClass('open');
    dropdownOpen = false;
    onhover = false;
  }
}

$body.mouseup(function () {
  closedropdown();
});

var dropdownButtons = $('.button-dropdown').mousedown(function (e) {
  $dropdownLinks.removeClass('hover');

  if (!dropdownOpen) {
    menuDown = true;
    opendropdown(this);
  } 
  e.preventDefault();
  return false;
}).mouseup(function () {
  return false;
}).click(function () {
  if (!menuDown) {
    closedropdown();
  }
  menuDown = false;
  return false;
});

$('#actionmenu').click(function () {
  dropdownOpen = true;
});

$body.click(function (event) {
  if (dropdownOpen) {
    if (!$(event.target).closest('.menu').length) {
      closedropdown();
      return false;
    }
  }
});

var fromClick = false;
var $dropdownLinks = $('.dropdownmenu a').mouseup(function () {
  closedropdown();
  if (!fromClick) {
    $(this).click();
  } 
  fromClick = false;
}).mouseover(function () {
  $dropdownLinks.removeClass('hover');
  $(this).addClass('hover');
}).mousedown(function () {
  fromClick = true;
});

$('#runwithalerts').click(function () {
  renderLivePreview(true);
  return false;
});

$('#runconsole').click(function () {
  editors.console.render();
  return false;
});

$('#createnew').click(function () {
  var i, key;
  analytics.createNew();
  // FIXME this is out and out [cr]lazy....
  jsbin.panels.savecontent = function(){};
  for (i = 0; i < sessionStorage.length; i++) {
    key = sessionStorage.key(i);
    if (key.indexOf('jsbin.content.') === 0) {
      sessionStorage.removeItem(key);
    }
  }
 
  jsbin.panels.saveOnExit = true;

  // first try to restore their default panels
  jsbin.panels.restore();

  // if nothing was shown, show html & live
  setTimeout(function () {
    if (jsbin.panels.getVisible().length === 0) {
      jsbin.panels.panels.html.show();
      jsbin.panels.panels.live.show();
    }
  }, 0)
});

jsbin.settings.includejs = jsbin.settings.includejs || false;
$('#enablejs').change(function () {
  jsbin.settings.includejs = this.checked;
  analytics.enableLiveJS(jsbin.settings.includejs);
  editors.live.render();
}).attr('checked', jsbin.settings.includejs);

if (jsbin.settings.hideheader) {
  $body.addClass('hideheader');
}

(function () {

var re = {
  head: /<head(.*)\n/i,
  meta: /<meta name="description".*?>/i,
  metaContent: /content=".*?"/i
};

var metatag = '<meta name="description" content="[add your bin description]" />\n';

$('#addmeta').click(function () {
  // if not - insert
  // <meta name="description" content="" />
  // if meta description is in the HTML, highlight it
  var editor = jsbin.panels.panels.html,
      cm = editor.editor,
      html = editor.getCode();

  if (!re.meta.test(html)) {
    if (re.head.test(html)) {
      html = html.replace(re.head, '<head$1\n' + metatag);
    } else {
      // slap in the top
      html = metatag + html;
    }
  }

  editor.setCode(html);

  // now select the text
  // editor.editor is the CM object...yeah, sorry about that...
  var cursor = cm.getSearchCursor(re.meta);
  cursor.findNext();

  var contentCursor = cm.getSearchCursor(re.metaContent);
  contentCursor.findNext();

  var from = { line: cursor.pos.from.line, ch: cursor.pos.from.ch + '<meta name="description" content="'.length }, 
      to = { line: contentCursor.pos.to.line, ch: contentCursor.pos.to.ch - 1 };

  cm.setCursor(from);
  cm.setSelection(from, to);
  cm.setOption('onCursorActivity', function () {
    cm.setOption('onCursorActivity', null);
    mark.clear();
  });

  var mark = cm.markText(from, to, 'highlight');

  cm.focus();

  return false;
});

// add navigation to insert meta data


}());
