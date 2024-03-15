import prisma from "../libs/prisma"
import bcrypt from "bcrypt"
import { hash } from "../utils/hash"
import { v4 as uuidv4 } from 'uuid';

const validateSession = async (id: string)=>{
  try {
    const session = await prisma.session.findFirstOrThrow({
      where: {
        id: id
      },
    })
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({
        where: {id: id}
      })
      return null
    }
    try {
      return await prisma.user.findFirstOrThrow({
        where: {id: session.userId}
      })
    } catch {
      return null
    }
  } catch {
    return null
  }
}

const login = async (username: string, password: string)=> {
  try {
    const hash = await prisma.password.findFirstOrThrow({
      where: {
        user: {
          username: username.toLowerCase()
        }
      }
    })
    const validPassword = await bcrypt.compare(password, hash?.hash)
    if (validPassword) {
      return await upsertSession(username)
    }
    return null
  } catch {
    return null
  }
}

const register = async (username: string, password: string)=> {
  const hashedPassword = await hash(password)
  try {
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        Password: {
          create: {
            hash: hashedPassword
          }
        }
      },
    });
    if (newUser) {
      return await upsertSession(username)
    }
    return null
  } catch {
    return null
  }
}

const logout = async (userId: string)=> {
  return await prisma.session.delete({
    where: {
      userId
    },
  })
}

const upsertSession = async (username: string) => {
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate()+7)

  const user = await prisma.user.findFirst({
    where: {
      username: username.toLowerCase()
    }
  })

  const session = await prisma.session.upsert({
    where: {
      userId: user?.id
    },
    update: {
      id: uuidv4(),
      expiresAt: sevenDaysFromNow,
    },
    create: {
      id: uuidv4(),
      expiresAt: sevenDaysFromNow,
      user: {
        connect: {
          username
        }
      }
    },
    select: {
      id: true,
      expiresAt: true,
      userId: true,
      user: true
    }
  })

  return ({session: session})
}

export const authService = {
  validateSession,
  login,
  register,
  logout
}
