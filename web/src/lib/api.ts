const API_URL = '/api';

export async function classifyText(text: string) {
  const res = await fetch(`${API_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
}

export async function createItem(item: any) {
  const res = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  return res.json();
}

export async function getItems(type?: string) {
  const url = type ? `${API_URL}/items?type=${type}` : `${API_URL}/items`;
  const res = await fetch(url);
  return res.json();
}

export async function updateItem(id: string, updates: any) {
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteItem(id: string) {
  const res = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function searchItems(q: string) {
  const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`);
  return res.json();
}
