// -------------------------------------
//  @created: 2020-11-09
//  @author:  Douglas Vinicius
//  @email:   douglvini@gmail.com
// -------------------------------------

'use strict';

const BASE_URL = "https://www.youtube.com/feeds/videos.xml?channel_id="
/*
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
*/

let videos = document.getElementById("videos");
let video_entry_temp = document.getElementById("video_entry_temp").content;

function show_channel_group(channel_id_list)
{
	// @todo to increase user experience this should be done on demand
	let video_list = [];
	for (let channel_i=0; channel_i < channel_id_list.length; channel_i++)
	{
		let request = new XMLHttpRequest();
		request.open("GET", BASE_URL + channel_id_list[channel_i], false);
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

			let video_entry = document.importNode(video_entry_temp, true);
			video_entry.querySelector(".video_entry").addEventListener("click", () =>
			{
				window.open(video_url, "_blank");
			});

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

browser.storage.local.get({group_list: []}).then((data) =>
{
	for (let name of data.group_list)
	{
		let group_entry = document.importNode(group_entry_temp, true);
		group_entry.querySelector("div").innerText = name;
		//group_entry.querySelector("div").addEventListener("click", science_action);
		navbar.appendChild(group_entry);
	}
	//show_channel_group(SCIENCE_CHANNELS);
});
