// -------------------------------------
//  @created: 2020-11-09
//  @author:  Douglas Vinicius
//  @email:   douglvini@gmail.com
// -------------------------------------

'use strict';

const FEED_BASE_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=";

let videos = document.getElementById("videos");
let video_entry_temp = document.getElementById("video_entry_temp").content;

function show_channel_group(channel_id_list)
{
	// @todo to increase user experience this should be done on demand
	let video_list = [];
	for (let channel_i=0; channel_i < channel_id_list.length; channel_i++)
	{
		let request = new XMLHttpRequest();
		request.open("GET",
				FEED_BASE_URL + channel_id_list[channel_i],
				false);
		request.send(null);
		let channel_videos = (new DOMParser()).parseFromString(request.responseText, "text/xml");
		let info_list = channel_videos.getElementsByTagName("entry");

		for (let video_i=0; video_i < info_list.length; video_i++)
		{
			let item = info_list[video_i];
			let title = item.getElementsByTagName("title")[0].innerHTML;
			let thumb_url = item.getElementsByTagName("media:thumbnail")[0].getAttribute("url");
			let description = item.getElementsByTagName("media:description")[0].innerHTML;
			let video_url = item.getElementsByTagName("link")[0].getAttribute("href");
			let published_date = item.getElementsByTagName("published")[0].innerHTML;

			let author = item.getElementsByTagName("author")[0];
			let channel_url = author.getElementsByTagName("uri")[0].innerHTML;
			let channel_name = author.getElementsByTagName("name")[0].innerHTML;

			// how old is the pub date to string
			let pub_date = new Date(published_date);
			let now_date = new Date(Date.now());
			let diff = Math.abs(now_date - pub_date);
			const EPOCH_TO_HOURS = 1/(1000 * 60 * 60);
			const EPOCH_TO_DAYS = 1/(1000 * 60 * 60 * 24);
			let days = Math.round(diff*EPOCH_TO_DAYS);

			let video_entry = video_entry_temp.querySelector("div").cloneNode(true);
			video_entry.addEventListener("click", () =>{window.open(video_url, "_blank");});

			video_entry.querySelector("#title a").innerText = title;
			video_entry.querySelector("#title a").setAttribute("href", video_url);
			video_entry.querySelector("#title a").setAttribute("target", "_blank");
			video_entry.querySelector("#title").addEventListener("click", (e) => {e.stopPropagation();});

			video_entry.querySelector("#date").innerText = days.toString() + " days ago";

			video_entry.querySelector("#channel a").innerText = channel_name;
			video_entry.querySelector("#channel a").setAttribute("href", channel_url);
			video_entry.querySelector("#channel a").setAttribute("target", "_blank");
			video_entry.querySelector("#channel").addEventListener("click", (e) => {e.stopPropagation();});

			description =  description.split('\n')[0];
			description =  description.substr(0, 150);
			video_entry.querySelector("#description").innerText = description;

			video_entry.querySelector("#thumb").addEventListener("click", (e) => {e.stopPropagation();});
			video_entry.querySelector("#thumb a").setAttribute("href", video_url);
			video_entry.querySelector("#thumb a").setAttribute("target", "_blank");
			video_entry.querySelector("#thumb img").setAttribute("src", thumb_url);
			video_list.push([video_entry, pub_date.getTime()]);
		}
	}

	video_list.sort((a, b) =>
	{
		return (a[1] < b[1]);
	});
	video_list.forEach((video_entry) =>
	{
		videos.appendChild(video_entry[0]);
	});
}

let navbar = document.getElementById("navbar");
let group_entry_temp = document.getElementById("group_entry_temp").content;
let group_config_temp = document.getElementById("group_config_temp").content;
let config_entry_temp = document.getElementById("config_entry_temp").content;
let chosen_group_entry = null;

browser.storage.local.get({group_list: []}).then(data =>
{
	function open_group(name, group_node)
	{
		while (videos.firstChild) {videos.removeChild(videos.lastChild);}

		if (chosen_group_entry != null) {chosen_group_entry.setAttribute("id", "");}
		chosen_group_entry = group_node;
		chosen_group_entry.setAttribute("id", "chosen");

		let group_data_tmp = {};
		group_data_tmp[name] = [];
		browser.storage.local.get(group_data_tmp).then(group_data =>
		{
			show_channel_group(group_data[name]);
		});
	}

	function open_group_config(name, group_node)
	{
		while (videos.firstChild) {videos.removeChild(videos.lastChild);}

		if (chosen_group_entry != null) {chosen_group_entry.setAttribute("id", "");}
		chosen_group_entry = group_node;
		chosen_group_entry.setAttribute("id", "chosen");

		let group_config = group_config_temp.querySelector("div").cloneNode(true);
		let delete_button = group_config.querySelector("#delete");
		delete_button.innerText = "Delete Group";
		delete_button.addEventListener("click", evt =>
		{
			if (confirm("Delete the group and all channels added ?"))
			{
				browser.storage.local.get({group_list: []}).then(group_list_data =>
				{
					let groups_list = group_list_data["group_list"];
					// @todo better way to remove a item in the middle of a list
					let new_groups_list = [];
					for (let group_item of groups_list)
					{
						if (group_item != name)
						{
							new_groups_list.push(group_item);
						}
					}
					browser.storage.local.set({group_list: new_groups_list}).then(() =>
					{
						browser.storage.local.remove(name);
						browser.tabs.reload();
					});
				});
			}
		});

		function channel_title_from_id(channel_id)
		{
			let request = new XMLHttpRequest();
			request.open("GET", FEED_BASE_URL + channel_id, false);
			request.send(null);
			let channel = (new DOMParser()).parseFromString(request.responseText, "text/xml");
			let title = channel.getElementsByTagName("title")[0].innerHTML;
			return title;
		}

		let title_input = group_config.querySelector("#title_change input");
		group_config.querySelector("#title_change label").innerText = "Group Title";
		let apply_button = group_config.querySelector("#apply");
		let cancel_button = group_config.querySelector("#cancel");
		let channel_box = group_config.querySelector("#channel_box");

		let group_data_init = {};
		group_data_init[name] = [];
		let config_channel_list = [];
		browser.storage.local.get(group_data_init).then(group_data =>
		{
			config_channel_list = group_data[name];
			function channel_box_update()
			{
				while (channel_box.firstChild) {channel_box.removeChild(channel_box.lastChild);}

				let local_config_channel_list = config_channel_list;
				for (let channel_id of local_config_channel_list)
				{
					let config_entry = config_entry_temp.querySelector("div").cloneNode(true);
					config_entry.querySelector("div").innerText = channel_title_from_id(channel_id);
					config_entry.querySelector("button").innerText = "X";
					config_entry.querySelector("button").addEventListener("click", evt =>
					{
						// @todo better remove algorithm
						let new_config_channel_list = []
						for (let channel_item of config_channel_list)
						{
							if (channel_id != channel_item)
							{
								new_config_channel_list.push(channel_item);
							}
						}
						config_channel_list = new_config_channel_list;
						channel_box_update();
					});
					channel_box.appendChild(config_entry);
				}
			}
			channel_box_update();
		});

		cancel_button.innerText = "Cancel";
		cancel_button.addEventListener("click", evt => {browser.tabs.reload();});

		title_input.value = name;
		apply_button.innerText = "Apply Changes";
		apply_button.addEventListener("click", evt =>
		{
			let config_group_data_tmp = {};
			config_group_data_tmp[name] = config_channel_list;
			browser.storage.local.set(config_group_data_tmp).then(() =>
			{
				let new_group_name = title_input.value;
				if ((new_group_name != name) && (new_group_name != ""))
				{
					let group_data_tmp = {};
					group_data_tmp[name] = [];
					browser.storage.local.get(group_data_tmp).then(group_data =>
					{
						group_data_tmp = {};
						group_data_tmp[new_group_name] = group_data[name];
						browser.storage.local.set(group_data_tmp).then(() =>
						{
							browser.storage.local.remove(name);
							browser.storage.local.get({group_list: []}).then(group_list_data =>
							{
								let groups_list = group_list_data["group_list"];
								groups_list[groups_list.indexOf(name)] = new_group_name;
								browser.storage.local.set({group_list: groups_list}).then(() =>
								{
									browser.tabs.reload();
								});
							});
						});
					});
				}
				else
				{
					browser.tabs.reload();
				}
			});
			console.log("CHANGES APPLIED")
		});
		videos.appendChild(group_config);
	}

	let first_group_entry = null;
	for (let name of data.group_list)
	{
		let group_entry = group_entry_temp.querySelector("div").cloneNode(true);
		if (first_group_entry == null)
		{
			first_group_entry = [name, group_entry];
		}
		let group_data_tmp = {};
		group_data_tmp[name] = [];
		browser.storage.local.get(group_data_tmp).then(group_data =>
		{
			let channel_count = 0;
			channel_count = group_data[name].length;
			group_entry.querySelector("div").innerText = "("+channel_count.toString()+") "+ name;
		});
		group_entry.addEventListener("click", evt => {open_group(name, group_entry);});
		group_entry.querySelector("button").addEventListener("click", evt =>
		{
			evt.stopPropagation();
			open_group_config(name, group_entry);
		});
		navbar.appendChild(group_entry);
	}
	// opening the first group as default 
	if (first_group_entry != null)
	{
		open_group(first_group_entry[0], first_group_entry[1]);
	}
});

// author notice
// @todo put a link in the author notice
let author_msg = document.createElement("div");
author_msg.innerText = "2020, YouOrg by Douglas Vinicius.";
author_msg.setAttribute("id", "author_msg");
document.getElementsByTagName("body")[0].appendChild(author_msg);
