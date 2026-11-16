'use strict';
const link = document.querySelector('a[data-destination]');
if (link) {
  const destination = new URL(link.href);
  destination.search = window.location.search;
  destination.hash = window.location.hash;
  link.href = destination.href;
  window.location.replace(destination.href);
}
