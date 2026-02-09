export default {

    // https://vk.com/video-220754053_456240761
    // https://vk.com/video7957477_456240710

    // clips-50256515?z=clip-50256515_456247391

    re: [
        // vk.com
        /^https?:\/\/(?:m\.)?vk\.com\/(video|clip)([\-\d]+)_([\d]+)/i,
        // vkvideo.ru (с любым поддоменом или без него)
        /^https?:\/\/(?:[\w\-]+\.)?vkvideo\.ru\/(video|clip)([\-\d]+)_([\d]+)/i,
        // старый формат clips
        /^https?:\/\/(?:m\.)?vk\.com\/clips([\-\d]+)\?z=clip-([\-\d]+)_([\d]+)/i
    ],

    skipMixins: ["noscript-redirect"],

    mixins: ["*"],

    provides: ['VK'],

    getData: function (url, cb, options, log) {
        // Нормализуем URL:
        // clip → https://vkvideo.ru/clip-{owner_id}_{video_id}
        // video → https://vk.com/video-{owner_id}_{video_id}

        let normalized = url;
        let type, ownerId, videoId;

        // Проверяем старый формат clips
        const clipsMatch = url.match(/^https?:\/\/(?:m\.)?vk\.com\/clips([\-\d]+)\?z=clip-([\-\d]+)_([\d]+)/i);
        if (clipsMatch) {
            type = 'clip';
            ownerId = clipsMatch[2];
            videoId = clipsMatch[3];
        } else {
            // Обычный формат
            const match = url.match(/^https?:\/\/(?:(?:m\.)?vk\.com|(?:[\w\-]+\.)?vkvideo\.ru)\/(video|clip)([\-\d]+)_([\d]+)/i);
            if (match) {
                type = match[1].toLowerCase();
                ownerId = match[2];
                videoId = match[3];
            }
        }

        if (type && ownerId && videoId) {
            if (type === 'clip') {
                normalized = `https://vkvideo.ru/clip${ownerId}_${videoId}`;
            } else if (type === 'video') {
                normalized = `https://vk.com/video${ownerId}_${videoId}`;
            }
        }

        // Если URL изменился и мы еще не делали редирект на этот URL
        if (normalized !== url && (!options.redirectsHistory || options.redirectsHistory.indexOf(normalized) === -1)) {
            return cb({ redirect: normalized, responseStatusCode: 417 });
        }

        return cb(null);
    },

    getMeta: function (meta, options, url, __isDefault) {
        //console.log('VK meta', JSON.stringify(meta));
        return {
            title: meta.og && meta.og.title,
            description: meta.og && meta.og.description,
            category: meta.og && meta.og.type,
            canonical: meta.og && meta.og.url,
            site: meta.og && meta.og.site_name || 'VK',

            medium: "video",

            duration: meta.video && meta.video.duration,

            thumbnail: meta.og && meta.og.image && meta.og.image.url,
            thumbnail_width: meta.og && meta.og.image && meta.og.image.width,
            thumbnail_height: meta.og && meta.og.image && meta.og.image.height,

            video: meta.og && meta.og.video && meta.og.video.url,
            video_width: meta.og && meta.og.video && meta.og.video.width,
            video_height: meta.og && meta.og.video && meta.og.video.height,
        }
    },

    getLinks: function (url, urlMatch, meta, log, options) {
        var links = [];
        if (meta.og && meta.og.image) {
            links.push({
                href: meta.og.image.url,
                type: CONFIG.T.image,
                rel: CONFIG.R.thumbnail,
                width: meta.og.image.width,
                height: meta.og.image.height
            });
        }
        if (meta.og && meta.og.video) {
            links.push({
                href: meta.og.video.url,
                type: CONFIG.T.text_html,
                rel: CONFIG.R.player,
                "aspect-ratio": (meta.og.video.width && meta.og.video.height)
                    ? (parseInt(meta.og.video.width, 10) / parseInt(meta.og.video.height, 10))
                    : 16 / 9,
                width: meta.og.video.width,
                height: meta.og.video.height
            });
        }
        //log('VK links', JSON.stringify(urlMatch));
        return links;
    },

    tests: [{
        noFeeds: true
    },

        "https://vk.com/video-220754053_456240761",
        "https://vk.com/clip-27246052_456240097",
        "https://m.vk.com/video-220754053_456240761",
        "https://m.vk.com/clip-27246052_456240097",
        "https://vksport.vkvideo.ru/clip-27246052_456240097",
        "https://vkvideo.ru/clip-36047336_456276304",
        "https://vkvideo.ru/video-56338600_456246979",
        "https://m.vkvideo.ru/clip-36047336_456276304",
        "https://m.vkvideo.ru/video-56338600_456246979"
    ]
};