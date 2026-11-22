const db = require('../db.json')

const MOCKAPI_URL = (process.env.MOCKAPI_URL || 'https://6b0174fb1c637a569e5313c7.mockapi.io/api').replace(/\/$/, '')

const FIELDS = {
  students: ['id', 'code', 'name', 'classroom'],
  records: ['id', 'studentId', 'points', 'reason', 'note', 'date', 'recordedBy']
}

function send(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function pick(resource, item) {
  if (!item || typeof item !== 'object') return item
  const result = {}
  for (const key of FIELDS[resource]) {
    if (item[key] !== undefined) result[key] = item[key]
  }
  return result
}

async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {}
    if (Buffer.isBuffer(req.body)) return req.body.length ? JSON.parse(req.body.toString()) : {}
    return req.body || {}
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString()
  return text ? JSON.parse(text) : {}
}

function handleUsers(req, res, id, query) {
  if (req.method !== 'GET') return send(res, 405, { message: 'Method not allowed' })
  if (id) {
    const user = db.users.find(item => String(item.id) === id)
    return user ? send(res, 200, user) : send(res, 404, {})
  }
  const filters = [...query.entries()]
  const list = db.users.filter(item => filters.every(([key, value]) => String(item[key]) === value))
  send(res, 200, list)
}

async function handleMockApi(req, res, resource, id, query) {
  const filters = [...query.entries()]
  let url = `${MOCKAPI_URL}/${resource}`
  if (id) url += `/${encodeURIComponent(id)}`
  if (filters.length) url += `?${query.toString()}`

  const options = { method: req.method, headers: { 'Content-Type': 'application/json' } }
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const body = pick(resource, await readBody(req))
    delete body.id
    options.body = JSON.stringify(body)
  }

  const upstream = await fetch(url, options)
  const text = await upstream.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: text }
  }

  if (!upstream.ok) {
    if (req.method === 'GET' && !id && upstream.status === 404) return send(res, 200, [])
    return send(res, upstream.status, typeof data === 'object' ? data : { message: String(data) })
  }

  if (Array.isArray(data)) {
    const list = data
      .map(item => pick(resource, item))
      .filter(item => filters.every(([key, value]) => String(item[key]) === value))
      .sort((a, b) => Number(a.id) - Number(b.id))
    return send(res, 200, list)
  }

  send(res, upstream.status, pick(resource, data))
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  const { pathname, searchParams } = new URL(req.url, 'http://localhost')
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'api') parts.shift()
  const [resource, rawId] = parts
  const id = rawId ? decodeURIComponent(rawId) : undefined

  try {
    if (resource === 'users') return handleUsers(req, res, id, searchParams)
    if (FIELDS[resource]) return await handleMockApi(req, res, resource, id, searchParams)
    send(res, 404, { message: 'Not found' })
  } catch (error) {
    send(res, 502, { message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้' })
  }
}
