// -------------------------------------
//  @created: 2020-11-11
//  @author:  Douglas Vinicius
//  @email:   douglvini@gmail.com
// -------------------------------------

'use strict';

const GROUPS_POPUP = `
<div id="youorg_groups_popup">
	<div id="groups">
		<div id="title">Add Channel To:</div>
		<div id="list"></div>
		<div id="new_group">
			<input type="text" name="Group name">
			<button>Create Group</button>
		</div>
		<button id="cancel">CANCEL</button>
	</div>
</div>
`;

const GROUP_ENTRY = `
<div class="group_entry">
<div>GROUP NAME HERE</div>
<button style="display:none;">X</button>
</div>
`;

const CUSTOM_STYLE = `
<style>
#youorg_groups_popup
{
	display: flex;
	position: fixed;
	z-index:1000000;
	background-color: #000000cc;
	width: 100%;
	height: 100%;
	margin: 0;
}
#youorg_groups_popup #groups
{
	background-color: #ffffff;
	width: 20%;
	height: 40%;
	margin-left: 40%;
	margin-top: 10%;
}

#youorg_groups_popup #title
{
	text-align: center;
	background-color: #cccccc;
	font-size: 20px;
	padding-bottom: 30px;
}
#youorg_groups_popup #list
{
	background-color: #555555;
	overflow: auto;
	width: 100%;
	height: 200px;
}

#youorg_groups_popup .group_entry button
{
	position: absolute;
	background-color: #eeaaaa;
	height: 100%;
	width: 40px;
	top: 0px;
	right: 0px;
}

#youorg_groups_popup .group_entry
{
	position: relative;
	height: 25px;
	text-align: center;
	font-size: 14px;
	cursor: pointer;
	padding-top: 3px;
	padding-bottom: 3px;
	background-color: #999999;
	margin-bottom: 2px;
	color: #000000;
}
#youorg_groups_popup #chosen
{
	background-color: #88cccc;
	border-style: solid;
	border-width: 3px;
	border-color: #440000;
}
#youorg_groups_popup .group_entry:hover
{
	background-color: #eeeeee;
}

#youorg_groups_popup #cancel
{
	width: 100%;
	height: 40px;
	background-color: #ffffff;
}
#youorg_groups_popup #new_group
{
	display: flex;
}
</style>
`;

let body_node = document.getElementsByTagName("body")[0];
let style = (new DOMParser()).parseFromString(CUSTOM_STYLE, "text/html").querySelector("style");
let groups_popup_tmp = (new DOMParser()).parseFromString(GROUPS_POPUP, "text/html").querySelector("div");
body_node.appendChild(style);

function create_and_append_button(parent_node, channel_id)
{
	let add_button = document.createElement("button");
	add_button.addEventListener("click", evt =>
	{
		evt.preventDefault();
		evt.stopPropagation();
		let groups = groups_popup_tmp.cloneNode(true);
		let cancel = groups.querySelector("#cancel");

		function delete_groups_popup()
		{
			let to_remove = body_node.querySelector("#youorg_groups_popup");
			body_node.removeChild(to_remove);
			console.log("DELETED!!!!");
		}
		cancel.addEventListener("click", evt => {delete_groups_popup();});

		function list_groups()
		{
			let list = groups.querySelector("#list");
			while (list.firstChild) {list.removeChild(list.lastChild);}

			browser.storage.local.get({group_list: []}).then(data =>
			{
				let group_name_list = data.group_list;
				for (let name of group_name_list)
				{
					let group_entry = (new DOMParser()).parseFromString(GROUP_ENTRY, "text/html").querySelector("div");

					group_entry.addEventListener("click", evt =>
					{
						let store_data = {};
						store_data[name] = [];
						browser.storage.local.get(store_data).then(data =>
						{
							let channel_id_list = data[name];
							if (channel_id_list.indexOf(channel_id) < 0)
							{
								channel_id_list.push(channel_id);
								store_data[name] = channel_id_list;
								browser.storage.local.set(store_data).then(() =>
								{
									delete_groups_popup();
									add_button_info_update();
								});
							}
							else
							{
								console.log("> This channel was already added to "+name+" group.");
								delete_groups_popup();
							}
						});
					});
					group_entry.querySelector("div").innerText = name;
					let tmp_group_data = {};
					tmp_group_data[name] = [];
					browser.storage.local.get(tmp_group_data).then(channel_data =>
					{
						if (channel_data[name].indexOf(channel_id) >= 0)
						{
							group_entry.querySelector("button").style.display = "block";
							group_entry.querySelector("button").addEventListener("click", evt =>
							{
								evt.stopPropagation();
								console.log("DELETE_CHANNEL_FROM_GROUP");
								let remove_set_group_data = {};
								remove_set_group_data[name] = [];
								for (let remove_channel of channel_data[name])
								{
									if (channel_id != remove_channel)
									{
										remove_set_group_data[name].push(remove_channel);
									}
								}
								browser.storage.local.set(remove_set_group_data).then(() =>
								{
									list_groups();
									add_button_info_update();
								});
							});
							group_entry.setAttribute("id", "chosen");
						}
					});
					list.appendChild(group_entry);
				}
			});
		}
		function add_new_group()
		{
			browser.storage.local.get({group_list: []}).then(data =>
			{
				let group_name_list = data.group_list;
				let group_name = add_group_input.value;
				if (group_name != "")
				{
					if (group_name_list.indexOf(group_name) == -1)
					{
						// @cleanup if storage.local.set fail i have a bug inside group_name_list
						group_name_list.push(group_name);
						browser.storage.local.set({group_list: group_name_list}).then(() =>
						{
							list_groups();
						});
						console.log("ADD GROUP");
					}
					add_group_input.value = "";
				}
			});
		}
		list_groups();
		let add_group_input = groups.querySelector("#new_group input");
		let add_group_button = groups.querySelector("#new_group button");
		add_group_input.addEventListener("keyup", (evt) => {if (evt.keyCode === 13){add_new_group();}});
		add_group_button.addEventListener("click", (evt) => {add_new_group();});

		body_node.appendChild(groups);
	});
	
	function add_button_info_update()
	{
		browser.storage.local.get({group_list: []}).then(data =>
		{
			let group_name_list = data.group_list;
			// @speed I can get all members of group_name_list from storage at the same time
			browser.storage.local.get(group_name_list).then(channel_data =>
			{
				console.log("UPDATING_ADD_TO_GROUP_BUTTON");
				let added_to_groups = [];
				for (let name of group_name_list)
				{
					if (channel_data[name].indexOf(channel_id) >= 0)
					{
						added_to_groups.push(name);
					}
				}
				if (added_to_groups.length > 0)
				{
					add_button.innerText = "O";
					let group_text = "Added to Groups:\n";
					for (let gp of added_to_groups)
					{
						group_text += gp + "\n";
					}
					add_button.setAttribute("title", group_text);
				}
				else
				{
					add_button.innerText = "+";
				}
			});
		});
	}

	add_button_info_update();
	add_button.style.color = "#000000";
	parent_node.appendChild(add_button);
}

// adding buttons to /feed/channels page
let page_manager =  document.getElementById("page-manager");
let observer_list = [];
let channels_page_list = [];
function check_more_channels_loaded(mutation_list, observer, contents)
{
	for (let mutation of mutation_list)
	{
		if (mutation.type === "childList")
		{
			for (let ch of contents.childNodes)
			{
				if (channels_page_list.indexOf(ch) == -1)
				{
					apply_buttons_sub_page(ch);
					channels_page_list.push(ch);
				}
			}
		}
	}
}

function handle_sub_page_observer(mutation_list, observer)
{
	for (let mutation of mutation_list)
	{
		if (mutation.type === "childList")
		{
			for (let obs of observer_list)
			{
				obs[1].disconnect();
			}
			observer_list = [];
			for (let child of page_manager.childNodes)
			{
				let obs = new MutationObserver(handle_sub_page_observer);
				obs.observe(child, {childList: false, attributes: true, subtree: false,
						attributeFilter: ["role"]});
				observer_list.push([child, obs]);
			}
		}
		else if (mutation.type === "attributes")
		{
			let child = null;
			for (let obs of observer_list)
			{
				if (obs[1] === observer) {child = obs[0];}
			}
			if (child != null)
			{
				if (child.getAttribute("role") === "main")
				{
					console.log("page changed:", window.location.pathname);
					if (window.location.pathname === "/feed/channels")
					{
						let channel_panel = child.querySelector("#primary");
						let contents = channel_panel.querySelector("#contents");
						let obs = new MutationObserver((ml, o) => {check_more_channels_loaded(ml, o, contents);});
						obs.observe(contents, {childList: true});
						if (contents.childNodes.length > 0)
						{
							apply_buttons_sub_page(contents.firstChild);
							channels_page_list.push(contents.firstChild);
						}
					}
					else
					{
						channels_page_list = [];
					}
				}
			}
		}
	}
}
let sub_page_observer = new MutationObserver(handle_sub_page_observer);
sub_page_observer.observe(page_manager, {childList: true});

function apply_buttons_sub_page(root)
{
	let sub_channels = root.getElementsByTagName("ytd-channel-renderer");
	for (let channel of sub_channels)
	{
		let sub_button = channel.querySelector("#subscribe-button");
		let channel_link = channel.querySelector(".channel-link").getAttribute("href");

		let channel_link_split = channel_link.split("/");
		let channel_id = channel_link_split[2];
		if (channel_link_split[1] == "user")
		{
			// get the feed xml page only to transform username into channel_id
			let request = new XMLHttpRequest();
			request.open("GET", "https://www.youtube.com/feeds/videos.xml?user=" + channel_id, true);
			request.onload = e =>
			{
				let dom = (new DOMParser()).parseFromString(request.responseText, "text/xml").getElementsByTagName("entry")[0];
				channel_id = dom.getElementsByTagName("yt:channelId")[0].innerHTML;
				create_and_append_button(sub_button, channel_id);
			};
			request.send(null);
		}
		else
		{
			create_and_append_button(sub_button, channel_id);
		}
	}
}

if (window.location.pathname === "/feed/channels" && channels_page_list.length == 0)
{
	let channel_panel = document.getElementById("primary");
	let contents = channel_panel.querySelector("#contents");
	let obs = new MutationObserver((ml, o) => {check_more_channels_loaded(ml, o, contents);});
	obs.observe(contents, {childList: true});
	if (contents.childNodes.length > 0)
	{
		apply_buttons_sub_page(contents.firstChild);
		channels_page_list.push(contents.firstChild);
	}
}

// adding buttons to the side bar
function initialize_side_bar()
{
	function apply_buttons_sub_side_bar(root)
	{
		let bar_channels = root.querySelectorAll(":scope > ytd-guide-entry-renderer");

		for (let channel of bar_channels)
		{
			let base_node = channel.querySelector("#endpoint").querySelector("paper-item");
			let channel_id = channel.querySelector("#endpoint").getAttribute("href").split("/")[2];
			create_and_append_button(base_node, channel_id);
		}
	}

	let root = sections.childNodes[1].querySelector("#items");
	let expanded_channels = root.lastChild.querySelector("#expandable-items");
	let side_sub_observer = new MutationObserver((mutation_list, observer) =>
	{
		for (let mutation of mutation_list)
		{
			if (mutation.type === "childList")
			{
				apply_buttons_sub_side_bar(expanded_channels);
			}
		}
		side_sub_observer.disconnect();
	});
	side_sub_observer.observe(expanded_channels, {childList: true});
	apply_buttons_sub_side_bar(root);
}

let sections = document.getElementById("sections");
if (sections.childNodes.length >= 2)
{
	initialize_side_bar();
}
else
{
	let loaded_observer = new MutationObserver((mutation_list, observer) =>
	{
		for (let mutation of mutation_list)
		{
			if (mutation.type === "childList")
			{
				console.log("SIDE PANEL LATE INIT");
				initialize_side_bar();
				break;
			}
		}
		loaded_observer.disconnect();
	});
	loaded_observer.observe(sections, {childList: true});
}

console.log("__DONE__");
