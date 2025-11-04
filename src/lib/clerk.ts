import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

// Clerk configuration and utilities
export { clerkClient };

// Helper function to get user from Clerk
export async function getClerkUser(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user;
  } catch (error) {
    console.error('Error fetching Clerk user:', error);
    return null;
  }
}

// Helper function to get current user and sync with database
export async function getCurrentUserWithDatabase() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
          profileImageUrl: clerkUser.imageUrl,
        },
      });
    } else {
      // Update user if exists but data is outdated
      const needsUpdate = 
        dbUser.email !== clerkUser.emailAddresses[0].emailAddress ||
        dbUser.name !== `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
        dbUser.profileImageUrl !== clerkUser.imageUrl;

      if (needsUpdate) {
        dbUser = await prisma.user.update({
          where: { clerkId: clerkUser.id },
          data: {
            email: clerkUser.emailAddresses[0].emailAddress,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            profileImageUrl: clerkUser.imageUrl,
          },
        });
      }
    }

    return {
      clerkUser,
      dbUser,
    };
  } catch (error) {
    console.error('Error getting current user with database:', error);
    return null;
  }
}
