/* ============================================================
   POCKET TENNIS LEAGUE — League Manager (localStorage)
   ============================================================ */
'use strict';

class LeagueManager {
  static generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  static getLeagues() {
    try { return JSON.parse(localStorage.getItem('ptl_leagues') || '{}'); } catch { return {}; }
  }

  static saveLeagues(data) {
    try { localStorage.setItem('ptl_leagues', JSON.stringify(data)); } catch {}
  }

  static createLeague(name, playerName) {
    const leagues = LeagueManager.getLeagues();
    const code    = LeagueManager.generateCode();
    leagues[code] = {
      code, name,
      players:   [{ name: playerName, wins: 0, losses: 0, points: 0 }],
      season:    1,
      createdAt: Date.now(),
    };
    LeagueManager.saveLeagues(leagues);
    return code;
  }

  static joinLeague(code, playerName) {
    const leagues = LeagueManager.getLeagues();
    const c = code.toUpperCase().trim();
    if (!leagues[c]) return null;
    const existing = leagues[c].players.find(p => p.name === playerName);
    if (!existing) {
      leagues[c].players.push({ name: playerName, wins: 0, losses: 0, points: 0 });
      LeagueManager.saveLeagues(leagues);
    }
    return leagues[c];
  }

  static recordResult(code, winnerName, loserName) {
    const leagues = LeagueManager.getLeagues();
    if (!leagues[code]) return;
    const winner = leagues[code].players.find(p => p.name === winnerName);
    const loser  = leagues[code].players.find(p => p.name === loserName);
    if (winner) { winner.wins++;   winner.points += 3; }
    if (loser)  { loser.losses++; }
    LeagueManager.saveLeagues(leagues);
  }

  static getLeague(code) {
    return LeagueManager.getLeagues()[code] || null;
  }
}
