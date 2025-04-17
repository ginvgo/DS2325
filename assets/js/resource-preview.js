const username = "ginvgo"; // 替换
const repo = "DS2325";
const folder = "resources";

const params = new URLSearchParams(location.search);
const filename = params.get("file");

if (!filename) {
  document.body.innerHTML = "<p>文件不存在</p>";
  throw new Error("No filename");
}

document.getElementById("file-name").textContent = filename;

fetch(`https://api.github.com/repos/${username}/${repo}/contents/${folder}`)
  .then(res => res.json())
  .then(async files => {
    const file = files.find(f => f.name === filename);
    if (!file) {
      document.getElementById("file-info").textContent = "未找到该文件";
      return;
    }

    const { size, download_url, path } = file;

    const commitRes = await fetch(`https://api.github.com/repos/${username}/${repo}/commits?path=${path}&per_page=1`);
    const commits = await commitRes.json();
    const lastModified = commits[0]?.commit?.committer?.date || "";

    document.getElementById("file-info").innerHTML = `
      <p>类型：${getFileType(filename)}</p>
      <p>大小：${formatSize(size)}</p>
      <p>修改时间：${formatDate(lastModified)}</p>
    `;

    document.getElementById("download-btn").href = download_url;

    // 简易预览
    if (filename.endsWith(".pdf")) {
      document.getElementById("file-preview").innerHTML = `
        <iframe src="${download_url}" width="100%" height="600px"></iframe>
      `;
    } else if (filename.endsWith(".txt") || filename.endsWith(".md")) {
      const text = await fetch(download_url).then(res => res.text());
      document.getElementById("file-preview").innerHTML = `<pre>${text}</pre>`;
    } else {
      document.getElementById("file-preview").innerHTML = `<p>暂不支持预览该类型</p>`;
    }
  });

function getFileType(name) {
  return name.split('.').pop().toUpperCase();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('zh-CN');
}
