// -------------------------------------
//  @created: 2020-11-09
//  @author:  Douglas Vinicius
//  @email:   douglvini@gmail.com
// -------------------------------------

'use strict';

const BASE_URL = "https://www.youtube.com/feeds/videos.xml?channel_id="
const SCIENCE_CHANNELS = 
[
	"UCYNbYGl89UUowy8oXkipC-Q", // Dr. Becky
	"UCu6mSoMNzHQiBIOCkHUa2Aw", // Cody's Lab
	"UCsXVk37bltHxD1rDPwtNM8Q"  // Kurzgesagt
];

const COMPUTER_CHANNELS = 
[
	"UC9-y-6csu5WGm29I7JiwpnA", // Computerphile
	"UC8uT9cgJorJPWu7ITLGo9Ww", // 8bitguy
	"UCS0N5baNlQWJCUrhCEo8WlA"  // Ben Eater
];

let videos = document.getElementById("videos");
let video_entry_temp = document.getElementById("video_entry_temp").content;

function show_channel_group(channel_id_list)
{
	for (let channel_i=0; channel_i < channel_id_list.length; channel_i++)
	{
		let request = new XMLHttpRequest();
		request.open("GET", BASE_URL + channel_id_list[channel_i], false);
		request.send(null);
		let channel_videos = (new DOMParser()).parseFromString(request.responseText, "text/xml");
		let info_list = channel_videos.getElementsByTagName("entry");

		for (let video_i=0; video_i < info_list.length; video_i++)
		{
			// video_link.setAttribute("href", url);
			// video_link.setAttribute("target", "_blank");
			let item = info_list[video_i];
			let title = item.getElementsByTagName("title")[0].innerHTML;
			let thumb_url = item.getElementsByTagName("media:thumbnail")[0].getAttribute("url");
			let video_url = item.getElementsByTagName("link")[0].getAttribute("href");

			let video_entry = document.importNode(video_entry_temp, true);
			video_entry.querySelector("h3").innerText = title;
			video_entry.querySelector("div").addEventListener("click", () =>
			{
				window.open(video_url, "_blank");
			});
			let thumb = video_entry.querySelector("img");
			thumb.setAttribute("src", thumb_url);
			videos.appendChild(video_entry);
		}
	}
}

function computer_action()
{
	while (videos.firstChild)
	{
		videos.lastChild.remove();
	}
	show_channel_group(COMPUTER_CHANNELS);
}
function science_action()
{
	while (videos.firstChild)
	{
		videos.lastChild.remove();
	}

	show_channel_group(SCIENCE_CHANNELS);
}

let navbar = document.getElementById("navbar");

let group_entry_temp = document.getElementById("group_entry_temp").content;
let science_group = document.importNode(group_entry_temp, true);
science_group.querySelector("h3").innerText = "Science";
science_group.querySelector("div").addEventListener("click", science_action);
let computer_group = document.importNode(group_entry_temp, true);
computer_group.querySelector("h3").innerText = "Computers";
computer_group.querySelector("div").addEventListener("click", computer_action);
navbar.appendChild(science_group);
navbar.appendChild(computer_group);
