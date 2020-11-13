// -------------------------------------
//  @created: 2020-11-09
//  @author:  Douglas Vinicius
//  @email:   douglvini@gmail.com
// -------------------------------------

'use strict';

const CONTENTS_PAGE = "contents.html";
const BLANK_PAGE = "about:blank";

let content_tab_id = null;
browser.browserAction.onClicked.addListener(async (tab, on_clicked_data) =>
{
	if (content_tab_id != null)
	{
		browser.tabs.update(content_tab_id, {"active" : true});
		browser.tabs.reload();
	}
	else
	{
		let content_tab = await browser.tabs.create({"url":"src/" + CONTENTS_PAGE, "active": true});
		content_tab_id = content_tab.id;
	}
});

browser.tabs.onRemoved.addListener((tab_id, remove_info) =>
{
	content_tab_id = tab_id == content_tab_id ? null : content_tab_id;
});

browser.tabs.onUpdated.addListener((tab_id, change_info, tab) =>
{
	if (tab_id == content_tab_id)
	{
		let sub = tab.url.substr(-CONTENTS_PAGE.length);
		if (tab.url != BLANK_PAGE && sub != CONTENTS_PAGE)
		{
			content_tab_id = null;
		}
	}
});
