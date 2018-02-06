const cheerio = require('cheerio');
const _ = require('lodash');

module.exports = {
    exerciseDirectoryTransformer(html) {
        const $ = cheerio.load(html);

        const header = $('body h2:contains("Exercises")');
        header.next('ul').addClass('exercise-directory-container');
        header.remove();

        return $('.exercise-directory-container')
            .parent()
            .html();
    },
    exerciseMenuTransformer(html) {
        const $ = cheerio.load(html);

        $('body table:first-of-type').remove();
        $('body table.bar').remove();
        $('body > p:empty').remove();

        const wrapper = $('<div></div>');

        $('body > h2').each((i, elm) => {
            const $elm = $(elm);
            const id = _.kebabCase($elm.text());
            const next = $(elm).next('table');

            next.addClass('exercise-menu-exercises');
            next.addClass(id);
        });

        $('.exercise-menu-exercises').appendTo(wrapper);
        wrapper.find('center').remove();

        return `<div class="exercise-menu-container">${wrapper.html()}</div>`;
    },
    exerciseTransformer(html) {
        const $ = cheerio.load(html);

        $('body table:first-of-type').addClass('exercise-name-container');
        $('body table.bar').remove(); // navigation bar

        const exerciseContainer = $('.ExVideo').closest('table');
        exerciseContainer.addClass('exercise-container');

        exerciseContainer.find('tr  td  h2').each((i, elm) => {
            const $elm = $(elm);
            const id = _.kebabCase($elm.text());
            const toWrap = $elm.nextUntil('h2');

            $elm.addClass('exercise-section-header');

            const wrapper = $(`<div class="exercise-section ${id}"></div>`);
            $elm.after(wrapper);
            toWrap.appendTo(wrapper);
        });

        $('.exercise-section.muscles')
            .find('p')
            .each((i, elm) => {
                const $elm = $(elm);
                const id = _.kebabCase($elm.text());
                const toWrap = $elm.next('ul');

                $elm.addClass('muscle-group-title');
                toWrap.addClass('muscle-group-list');

                const wrapper = $(`<div class="muscle-group ${id}"></div>`);
                $elm.before(wrapper);
                wrapper.append($elm);
                wrapper.append(toWrap);
            });

        return $.html();
    },
};
