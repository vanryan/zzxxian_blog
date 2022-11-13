---
title: How to Mod Beat Saber on Meta Quest 
date: "2022-11-11T20:38:22.330Z"
template: post
draft: false
slug: "mod-beat-saber-on-oculus-quest" 
category: "gadgets"
tags:
  - "Tech"
  - "Gadgets"
  - "VR"
  - "Oculus"
---

# How to Mode Beat Saber on Meta/Oculus Quest

A basic problem to solve is -- how to play custom songs in Beat Saber on Meta Quest?

Like on other platforms, a typical way to custom settings/content is to go developer mode. [SideQuest](https://sidequestvr.com/) is the most common tool that we use to add mods or play customized apps on Oculus. This process is commonly referred to as [Sideloading](https://en.wikipedia.org/wiki/Sideloading).

## SideQuest BMBF with modded Beat Saber (Happy path)
A minimalistic guide will be:
1. Install SideQuest on your laptop, and sign in
2. Turn on developer mode of your Quest device, this can be done through the mobile app "Meta Quest"
3. Connect the Quest device to the laptop using the given Quest (USB-C) cable, then SideQuest should be able to detect the device and show connected/green
4. Download application apks for the applications needed. In this case, [BMBF](https://bmbf.dev/stable)
5. Install the apks onto Quest through the SideQuest app
6. SideQuest can help you easily back up your Quest app data as well - https://secure.oculus.com/my/cloud-backup/ 

## Updating Beat Saber (Tricky)
Beat Saber has been well maintained so we are seeing updates rather often. So how do we stay (more or less) up to date and still enjoy custom content?

The constraints are then (1) an updated version; (2) a modded version to work with BMBF. Attention! BMBF is inevitable here so we need to keep its version and the Beat Saber's version in sync.

There goes the steps (making use of SideQuest):
0. Back up your data (for e.g. Oculus cloud backup)
1. Uninstall outdated Beat Saber
2. Uninstall BMBF
3. Install BMBF (apk). Also note the Beat Saber version supported (say v1.a).
4. If the newest version of Beat Saber available (say v1.b) matches v1.a, then we are good --> Open BMBF, let it patch and install Beat Saber, done.
5. If v1.b does not match v1.a? Then we need to find a Beat Saber with a lower, matching version (v1.a), which is basically downgrading.
    1. Find the matching modded version in sites like https://oculusdb.rui2015.me/id/2448060205267927
    2. Download the modded Beat Saber from the site
    3. Install the beat-saber.apk onto the Quest through SideQuest app.
    4. Now open BMBF and let it patch and reinstall Beat Saber.

It is worth noting that, when there is a Beat Saber of version >= v1.a present on your Quest, when you use BMBF to reinstall Beat Saber, BMBF will do the following:
1. Keep a backup of the apk file of your Beat Saber
2. Patch the apk file from step 1
3. Install the patched Beat Saber

The logs from BMBF on Quest clearly show the above. (For e.g. "Adding libmain.so to the apk")

Thus if we have a modded Beat Saber with matching version installed on Quest, BMBF's workflow (delete, patch, install) should be able to help.

Trouble shooting?
If Beat Saber just couldn't start properly, try a couple of things.
1. In BMBF on Quest, go to Tools, and try out the options there, for e.g., "quick fix" (not there in v1.25.1), "reload mods", or even "refresh songs".
2. After installing Beat Saber, play solo on it once, and then do the BMBF workflow.

Other notes:
- The local address to BMBF can be seen on Quest when you run BMBF, you can access that from your laptop using the same WiFi, and then you'd be able to manage your songs easily from your browser.
- Back up data before starting any update workflows or anything involving reinstalling Beat Saber. You do not want to lose your data.
- Headset (Quest 2 for e.g.) allows usb debugging. Not sure if usb-c debugging is supported now but I generally do not use the usbc cable that comes with the headset




