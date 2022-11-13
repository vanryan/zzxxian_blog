---
title: How to Download Files from M3U8? 
date: "2022-11-13T11:41:22.330Z"
template: post
draft: false
slug: "how-to-download-m3u8-files" 
category: "tech"
tags:
  - "codec"
  - "HLS"
  - "gadget"
  - "tool"
  - "video"
  - "stream"
---

It is inevitable that one runs into .m3u or .m3u8 files these days, whether one notices this or not. If one used to download videos from websites more than 12+ years ago, one would remember retrieving flash -- .flv files with the developer tools. It is a similar process to get .m3u/.m3u8 files -- turn on developer tools, reload the page and the network function will give you .m3u/.m3u8 files.

## What is an M3U/M3U8 file?
According to wikipedia --
> M3U (MP3 URL or Moving Picture Experts Group Audio Layer 3 Uniform Resource Locator in full) is a computer file format for a multimedia playlist.

The initial release happened back in 1996 but the larger adoption happened after it got used for streaming on the Internet. Essentially an m3u/m3u8 file works as a single entry for a playlist, which represents a stream. Thus when we talk about downloadig an m3u/m3u8 file, despite we do download that file, we are actually talking about downloading the files described in the m3u/m3u8 file.

M3U8 is nothing but the unicode version of M3U, and you might've guessed it -- UTF-8.

M3U8 files are the basis for the **HTTP Live Streaming (HLS)** format (a streaming communication protocol, similar to **MPEG-DASH**) originally developed by *Apple* to stream video and radio to iOS devices, and which is now a popular format for adaptive streaming in general. The 2015 proposal for the HLS playlist format uses UTF-8 exclusively and does not distinguish between the "m3u" and "m3u8" file name extensions. This protocol is documented in 2017 as [RFC8216](https://www.rfc-editor.org/rfc/rfc8216.txt).

Let's take a look at two m3u8 file examples.

File 1:
```
#EXTM3U
#EXT-X-TARGETDURATION:10

#EXTINF:9.009,
http://media.example.com/first.ts
#EXTINF:9.009,
http://media.example.com/second.ts
#EXTINF:3.003,
http://media.example.com/third.ts
```

File 2:
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.000000,
index0.ts
#EXTINF:10.000000,
index1.ts
#EXTINF:10.000000,
index2.ts
#EXTINF:10.000000,
index3.ts
#EXTINF:10.000000,
index4.ts
#EXTINF:10.000000,
index5.ts
#EXT-X-ENDLIST
```

In a playlist, each entry (which is called a *Media Segment*) carries one file specification, which can be any one of the following:
- an absolute local pathname -- e.g., /home/files/index.mp4
- a local pathname relative to the M3U8 file location -- e.g. index.mp4
- a URL

From the example files above, we actually see a bunch of `.ts` files. This is actually very common in current video streams. A [.ts](https://fileinfo.com/extension/ts) file is a *MPEG-2 Transport Stream* file which stores video data compressed with standard MPEG-2 (.MPEG) video compression, and this format is used very commonly for stream videos.

The tags in an M3U8 file are straightforward. A few examples:

- `#EXTM3U` is the file header.
- `EXT-X-TARGETDURATION` indicates the max Media Segment duration for each segment in the playlist.
- `#EXTINF` indicates a Media Segment -- or a segment of the whole stream.
    -  From the RFC, "A Media Playlist contains a series of Media Segments that make up the overall presentation.  A Media Segment is specified by a URI and optionally a byte range. The duration of each Media Segment is indicated in the Media Playlist by its EXTINF tag.
- `#EXT-X-ENDLIST` is the end-of-list signal.

## How to download files?
The first step is of course to locate the `.m3u/.m3u8` file and download it. After that, how to download the files denoted? And more importantly, how to download them as a whole -- or, the whole stream as a single file? (like mp4)

[ffmpeg](https://ffmpeg.org/about.html) is the tool that we use here to download the resources included in a .m3u / .m3u8 file.

What is this tool then? According to the description from the ffmpeg project site:

> FFmpeg is the leading multimedia framework, able to decode, encode, transcode, mux, demux, stream, filter and play pretty much anything that humans and machines have created. It supports the most obscure ancient formats up to the cutting edge. No matter if they were designed by some standards committee, the community or a corporation. It is also highly portable: FFmpeg compiles, runs, and passes our testing infrastructure FATE across Linux, Mac OS X, Microsoft Windows, the BSDs, Solaris, etc. under a wide variety of build environments, machine architectures, and configurations. 

A github repo mirror for the main FFmpeg project is here: https://github.com/FFmpeg/FFmpeg.

A discussion related to the usage of FFmpeg is here: https://gist.github.com/tzmartin/fb1f4a8e95ef5fb79596bd4719671b5d. I found out about the FFmpeg project from it. Essentially all that we need can be found through `ffmpeg --help` or refer to the [manual](https://ffmpeg.org/ffmpeg.html).

Once you have the url for the m3u8 file, the command needed is
```
ffmpeg -i "http://<host>/<dir>/<file>.m3u8" -c copy <target>.mp4
```

- -c codec: codec name
    - We use `-c` to do stream copy. Stream copy is a mode selected by supplying the *copy* parameter to the -codec option. It makes ffmpeg omit the decoding and encoding step for the specified stream, so it does only demuxing and muxing.
- -i url: the input url

One can also make the prompts more readable by pipelining the commands:

```
echo "Enter m3u8 url:";read link; echo "Enter output filename:";read filename;./ffmpeg -i "$link" -c copy $filename.mp4
```

Another tool worth noting is the [youtbue-dl](https://github.com/ytdl-org/youtube-dl). It has its native HLS downloader, or you can use ffmpeg -- by giving `--hls-prefer-ffmpeg` vs `--hls-prefer-native`.
