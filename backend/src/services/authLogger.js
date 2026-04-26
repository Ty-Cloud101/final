const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const dataDir = path.join(__dirname, '../../data');
const csvPath = path.join(dataDir, 'auth_log.csv');
const csvHeader = 'id,username,password,ip_address,user_agent,timestamp';

const ensureDataDir = async () => {
  await fsp.mkdir(dataDir, { recursive: true });
};

const ensureCsvFile = async () => {
  await ensureDataDir();

  try {
    await fsp.access(csvPath, fs.constants.F_OK); // check if file exist
  } catch (err) {
    await fsp.writeFile(csvPath, `${csvHeader}\n`, 'utf8'); // if no exist, write a new file with the header line
  }
};

const escapeCsvField = (value) => { // takes any value and converts into sth safe to store in csv file
  if (value === null || value === undefined) {
    return '';
  }
  
  let str = String(value);

  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  
  const escaped = str.replace(/"/g, '""');
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
};

// reading one line into fields
const parseCsvLine = (line) => {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
};

const getNextId = async () => {
  const content = await fsp.readFile(csvPath, 'utf8');
  const lines = content.trimEnd().split(/\r?\n/);

  if (lines.length <= 1) {
    return 1;
  }

  const lastLine = lines[lines.length - 1];
  const fields = parseCsvLine(lastLine);
  const lastId = Number(fields[0]);

  if (Number.isFinite(lastId)) {
    return lastId + 1;
  }

  return lines.length;
};

const init = async () => {
  await ensureCsvFile();
};

const saveLoginAttempt = async (username, password, ip, userAgent) => {
  await ensureCsvFile();

  const id = await getNextId();
  const timestamp = new Date().toISOString();
  const record = [
    id,
    username,
    password,
    ip || '',
    userAgent || '',
    timestamp
  ].map(escapeCsvField).join(',');

  await fsp.appendFile(csvPath, `${record}\n`, 'utf8');
  return id;
};

const getAllAttempts = async () => {
  try {
    await fsp.access(csvPath, fs.constants.F_OK);
  } catch (err) {
    return [];
  }

  const content = await fsp.readFile(csvPath, 'utf8');
  const lines = content.trimEnd().split(/\r?\n/);

  if (lines.length <= 1) {
    return [];
  }

  const records = lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    return {
      id: Number(fields[0]) || 0,
      username: fields[1] || '',
      password: fields[2] || '',
      ip_address: fields[3] || '',
      user_agent: fields[4] || '',
      timestamp: fields[5] || ''
    };
  });

  return records.reverse();
};

module.exports = {
  init,
  saveLoginAttempt,
  getAllAttempts
};
