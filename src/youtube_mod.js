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

// @todo make this execute not only when the entire page is loaded.
let channel_panel = document.getElementById("primary");
// channel_panel.style.border = "thick solid #ff0000";
let sub_channels = channel_panel.getElementsByTagName("ytd-channel-renderer");

let body_node = document.getElementsByTagName("body")[0];
let style = (new DOMParser()).parseFromString(CUSTOM_STYLE, "text/html").querySelector("style");
let groups_popup_tmp = (new DOMParser()).parseFromString(GROUPS_POPUP, "text/html").querySelector("div");
body_node.appendChild(style);

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
			return;
			// change from username to a youtube channel_id
		}
		let groups = groups_popup_tmp.cloneNode(true);
		let cancel = groups.querySelector("#cancel");

		function delete_groups_popup(evt)
		{
			let to_remove = body_node.querySelector("#youorg_groups_popup");
			body_node.removeChild(to_remove);
			console.log("DELETED!!!!");
		}
		cancel.addEventListener("click", delete_groups_popup);
		function update_group_list()
		{
			let list = groups.querySelector("#list");
			while (list.firstChild) {list.removeChild(list.lastChild);}

			browser.storage.local.get({group_list: []}).then(data =>
			{
				let group_name_list = data.group_list;
				for (let name of group_name_list)
				{
					let group_entry = (new DOMParser()).parseFromString(GROUP_ENTRY, "text/html").querySelector("div");
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
							update_group_list();
						});
						console.log("ADD GROUP");
					}
					add_group_input.value = "";
				}
			});
		}
		update_group_list();
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

console.log("__DONE__");
