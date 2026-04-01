// Discord interaction types
export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
} as const;

export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9,
} as const;

export const ComponentType = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
  TEXT_INPUT: 4,
  USER_SELECT: 5,
  ROLE_SELECT: 6,
  MENTIONABLE_SELECT: 7,
  CHANNEL_SELECT: 8,
} as const;

export const ButtonStyle = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
  LINK: 5,
} as const;

// Verify Discord interaction signature
export async function verifyDiscordSignature(
  request: Request,
  publicKey: string
): Promise<{ valid: boolean; body: string }> {
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  const body = await request.text();

  if (!signature || !timestamp) {
    return { valid: false, body };
  }

  const encoder = new TextEncoder();
  const message = encoder.encode(timestamp + body);

  const signatureBytes = hexToUint8Array(signature);
  const publicKeyBytes = hexToUint8Array(publicKey);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    publicKeyBytes,
    { name: 'Ed25519' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'Ed25519',
    cryptoKey,
    signatureBytes,
    message
  );

  return { valid, body };
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Create approval message embed
export interface CommentApprovalData {
  commentId: string;
  postId: string;
  postUrl: string;
  userId: string;
  discordUsername: string;
  discordAvatar: string | null;
  amount: number;
  currency: string;
  content: string;
  siteUrl: string;
}

export function createApprovalMessage(data: CommentApprovalData) {
  return {
    embeds: [
      {
        title: '📝 New Comment Pending Approval',
        color: 0xFFD700, // Gold color
        fields: [
          {
            name: '💰 Donation Amount',
            value: `${data.amount} ${data.currency}`,
            inline: true,
          },
          {
            name: '👤 User',
            value: data.discordUsername,
            inline: true,
          },
          {
            name: '🔗 Post',
            value: `[View Post](${data.postUrl})`,
            inline: true,
          },
          {
            name: '💬 Comment',
            value: data.content.length > 1000 
              ? data.content.substring(0, 997) + '...' 
              : data.content,
            inline: false,
          },
        ],
        thumbnail: data.discordAvatar
          ? { url: data.discordAvatar }
          : undefined,
        timestamp: new Date().toISOString(),
        footer: {
          text: `Comment ID: ${data.commentId}`,
        },
      },
    ],
    components: [
      {
        type: ComponentType.ACTION_ROW,
        components: [
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.SUCCESS,
            label: 'Approve',
            custom_id: `approve_comment:${data.commentId}`,
            emoji: { name: '✅' },
          },
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.DANGER,
            label: 'Reject',
            custom_id: `reject_comment:${data.commentId}`,
            emoji: { name: '❌' },
          },
          {
            type: ComponentType.BUTTON,
            style: ButtonStyle.LINK,
            label: 'View Post',
            url: data.postUrl,
          },
        ],
      },
    ],
  };
}

// Send message to Discord channel
export async function sendDiscordMessage(
  channelId: string,
  botToken: string,
  message: object
): Promise<{ id: string } | null> {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  );

  if (!response.ok) {
    console.error('Failed to send Discord message:', await response.text());
    return null;
  }

  return response.json();
}

// Update Discord message (for showing approval status)
export async function updateDiscordMessage(
  channelId: string,
  messageId: string,
  botToken: string,
  message: object
): Promise<boolean> {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  );

  return response.ok;
}

// Create response for approved/rejected comment
export function createApprovalResultEmbed(
  originalEmbed: any,
  approved: boolean,
  reviewerName: string
) {
  const embed = { ...originalEmbed };
  embed.color = approved ? 0x00FF00 : 0xFF0000; // Green or Red
  embed.title = approved ? '✅ Comment Approved' : '❌ Comment Rejected';
  embed.fields = [
    ...embed.fields,
    {
      name: approved ? 'Approved By' : 'Rejected By',
      value: reviewerName,
      inline: true,
    },
  ];
  
  return {
    embeds: [embed],
    components: [], // Remove buttons after action
  };
}
