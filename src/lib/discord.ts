interface GuildMember {
  roles: string[];
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  nick: string | null;
  joined_at: string;
}

export async function checkUserRoles(
  accessToken: string,
  guildId: string
): Promise<string[]> {
  const response = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
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
