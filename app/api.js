function wrappedFetch(url) {
    return fetch(url).then(res => res.json());
}
