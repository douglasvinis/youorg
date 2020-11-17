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
GROUP NAME HERE
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

#youorg_groups_popup .group_entry
{
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
					scan_and_apply_buttons(ch);
					channels_page_list.push(ch);
				}
			}
		}
	}
}

function handle_observer(mutation_list, observer)
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
				let obs = new MutationObserver(handle_observer);
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
							scan_and_apply_buttons(contents.firstChild);
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
let observer = new MutationObserver(handle_observer);
observer.observe(page_manager, {childList: true});

function scan_and_apply_buttons(root)
{
	let sub_channels = root.getElementsByTagName("ytd-channel-renderer");
	for (let channel of sub_channels)
	{
		let sub_button = channel.querySelector("#subscribe-button");
		let channel_link = channel.querySelector(".channel-link").getAttribute("href");
		let add_button = document.createElement("button");
		add_button.addEventListener("click", evt =>
		{
			let channel_link_split = channel_link.split("/");
			let channel_id = channel_link_split[2];
			if (channel_link_split[1] == "user")
			{
				// disable the add_button so the user cant click while the transition to add group page is not
				// completed
				add_button.disabled = true;
				// @speed is this slow?
				// get the feed xml page only to transform username into channel_id
				let request = new XMLHttpRequest();
				request.open("GET", "https://www.youtube.com/feeds/videos.xml?user=" + channel_id, false);
				request.send(null);
				let dom = (new DOMParser()).parseFromString(request.responseText, "text/xml").getElementsByTagName("entry")[0];
				channel_id = dom.getElementsByTagName("yt:channelId")[0].innerHTML;
				add_button.disabled = false;
			}
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
									});
								}
								else
								{
									console.log("> This channel was already added to "+name+" group.");
									delete_groups_popup();
								}
							});
						});
						group_entry.innerText = name;
						//group_entry.setAttribute("id", "chosen");
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
		// add_button.setAttribute("id", "youorg_button");
		add_button.innerText = "ADD TO GROUP";
		add_button.style.color = "#000000";
		sub_button.appendChild(add_button);
	}
}

console.log("__DONE__");
