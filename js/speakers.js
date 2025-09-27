// js/speakers.js
const sheets = [
  {
    name: "2025 Fall",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ7vHVsAqORSc-micw2en8uc8SQffDPwxrWSPTyloE0cMj7vD5gcRlTOAgGFewzcZO8klHevQTnhQN/pub?gid=1379695306&single=true&output=csv"
  },
  {
    name: "2025 Spring",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZ7vHVsAqORSc-micw2en8uc8SQffDPwxrWSPTyloE0cMj7vD5gcRlTOAgGFewzcZO8klHevQTnhQN/pub?gid=0&single=true&output=csv"
  }
];

function parseSheetLabel(name) {
  const match = name.match(/(\d{4})\s+(Spring|Fall)/);
  if (!match) return null;
  return { year: parseInt(match[1]), term: match[2] };
}

function renderSheet(title, data, container) {
  if (!data || !data.length) return;

  let toggleCounter = 1;

  const parsed = parseSheetLabel(title);
  const heading = `
    <h2>${parsed.term} ${parsed.year} Speakers</h2>
    <p>All talks are at 12 noon Eastern Time.</p>
  `;

  let html = `
    ${heading}
    <div class="container">
      <table id="speakers_table">
        <tbody>
          <tr>
            <th>Date</th>
            <th>Speaker</th>
            <th>Affiliation</th>
            <th>Title</th>
            <th>Talk Link</th>
          </tr>
  `;

  data.forEach(row => {
    if (!row.Date) return;

    const id = toggleCounter++;
    const hasAbstractOrBio = row.Abstract || row["Short Bio"];

    const titleCell = `
      ${row.Title || ''}
      ${hasAbstractOrBio ? `
        <div onclick="toggleDetails(${id})" id="moreDetailsBtn_${id}" class="showBtn">
          <a id="showDetails_${id}">+ Show details</a>
          <a id="hideDetails_${id}" style="display:none;">- Hide details</a>
        </div>` : ''
    }`;

    html += `
      <tr>
        <td>${row.Date}</td>
        <td>${row.speaker_link ? `<a href="${row.speaker_link}" target="_blank">${row.Speaker}</a>` : row.Speaker || ''}</td>
        <td>${row.Affiliation || ''}</td>
        <td>${titleCell}</td>
        <td>${row["Talk Link"] ? `<a href="${row["Talk Link"]}" target="_blank">${row["Talk Link"].includes("zoom") ? "Zoom" : "Link"}</a>` : ''}</td>
      </tr>
    `;

    if (hasAbstractOrBio) {
      html += `
        <tr id="rowDetails_${id}" style="display:none;">
          <td colspan="6">
            ${row.Title ? `<p style="font-size: 20px;">${row.Title}</p>` : ''}
            ${row.Abstract ? `<p>${row.Abstract}</p>` : ''}
            ${row["Short Bio"] ? `<p style="font-size: 20px;">Bio</p><p>${row["Short Bio"]}</p>` : ''}
          </td>
        </tr>
      `;
    }
  });

  html += '</tbody></table></div>';
  container.insertAdjacentHTML('beforeend', html);
}

function toggleDetails(n) {
  const row = document.getElementById(`rowDetails_${n}`);
  const show = document.getElementById(`showDetails_${n}`);
  const hide = document.getElementById(`hideDetails_${n}`);
  const isHidden = show.style.display !== 'none';
  row.style.display = isHidden ? 'contents' : 'none';
  show.style.display = isHidden ? 'none' : 'inline';
  hide.style.display = isHidden ? 'inline' : 'none';
}

function loadSheetsSequentially(sheets, container, index = 0) {
  if (index >= sheets.length) return;
  const sheet = sheets[index];
  console.log(`Loading sheet: ${sheet.name}`);
  Papa.parse(sheet.url, {
    download: true,
    header: true,
    complete: results => {
      if (results.data && results.data.length > 0) {
        console.log(`First row for ${sheet.name}:`, results.data[0]);
      } else {
        console.log(`No data for ${sheet.name}`);
      }
      renderSheet(sheet.name, results.data.filter(r => r.Date), container);
      loadSheetsSequentially(sheets, container, index + 1);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('speakers_table_container');
  loadSheetsSequentially(sheets, container);
});
