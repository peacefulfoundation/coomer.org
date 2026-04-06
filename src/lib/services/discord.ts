interface GuildMember {
  roles: string[];
  user: { id: string; username: string; avatar: string | null };
  nick: string | null;
  joined_at: string;
}

export async function checkUserRoles(accessToken: string, guildId: string): Promise<string[]> {
  const response = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Discord API error: ${response.status}`);
  }

  const member: GuildMember = await response.json();
  return member.roles;
}

export function hasKofiRole(userRoles: string[], kofiRoleId: string): boolean {
  return userRoles.includes(kofiRoleId);
}

export async function verifyKofiMembership(
  accessToken: string,
  guildId: string,
  kofiRoleId: string
): Promise<boolean> {
  try {
    const roles = await checkUserRoles(accessToken, guildId);
    return hasKofiRole(roles, kofiRoleId);
  } catch (error) {
    console.error('Error verifying Ko-fi membership:', error);
    return false;
  }
}

// Discord Bot utilities
export const InteractionType = { PING: 1, MESSAGE_COMPONENT: 3 } as const;
export const InteractionResponseType = { PONG: 1, UPDATE_MESSAGE: 7, CHANNEL_MESSAGE_WITH_SOURCE: 4 } as const;
export const ComponentType = { ACTION_ROW: 1, BUTTON: 2 } as const;
export const ButtonStyle = { PRIMARY: 1, SUCCESS: 3, DANGER: 4, LINK: 5 } as const;

export async function verifyDiscordSignature(
  request: Request,
  publicKey: string
): Promise<{ valid: boolean; body: string }> {
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  const body = await request.text();

  if (!signature || !timestamp) return { valid: false, body };

  const encoder = new TextEncoder();
  const message = encoder.encode(timestamp + body);
  const signatureBytes = hexToUint8Array(signature);
  const publicKeyBytes = hexToUint8Array(publicKey);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', publicKeyBytes, { name: 'Ed25519' }, false, ['verify']
  );

  const valid = await crypto.subtle.verify('Ed25519', cryptoKey, signatureBytes, message);
  return { valid, body };
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export interface CommentApprovalData {
  commentId: string;
  postId: string;
  postUrl: string;
  discordUsername: string;
  discordAvatar: string | null;
  amount: number;
  currency: string;
  content: string;
}

export function createApprovalMessage(data: CommentApprovalData) {
  return {
    embeds: [{
      title: '📝 New Comment Pending Approval',
      color: 0xFFD700,
      fields: [
        { name: '💰 Donation', value: `${data.amount} ${data.currency}`, inline: true },
        { name: '👤 User', value: data.discordUsername, inline: true },
        { name: '🔗 Post', value: `[View](${data.postUrl})`, inline: true },
        { name: '💬 Comment', value: data.content.slice(0, 1000), inline: false },
      ],
      thumbnail: data.discordAvatar ? { url: data.discordAvatar } : undefined,
      timestamp: new Date().toISOString(),
      footer: { text: `ID: ${data.commentId}` },
    }],
    components: [{
      type: ComponentType.ACTION_ROW,
      components: [
        { type: ComponentType.BUTTON, style: ButtonStyle.SUCCESS, label: 'Approve', custom_id: `approve:${data.commentId}`, emoji: { name: '✅' } },
        { type: ComponentType.BUTTON, style: ButtonStyle.DANGER, label: 'Reject', custom_id: `reject:${data.commentId}`, emoji: { name: '❌' } },
        { type: ComponentType.BUTTON, style: ButtonStyle.LINK, label: 'View Post', url: data.postUrl },
      ],
    }],
  };
}

export async function sendDiscordMessage(channelId: string, botToken: string, message: object): Promise<{ id: string } | null> {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bot ${botToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  return response.ok ? response.json() : null;
}
