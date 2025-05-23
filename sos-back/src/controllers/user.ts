/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../config/db"
import { Request, Response } from "express"

export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await prisma.user.findMany()
		res.json({ data })
	} catch (error) {
		res.json({ msg: "Error, no se pudieron obtener los usuarios", error })
		console.error(error)
	}
}

export const getUserById = async (req: Request, res: Response) => {
	const userId = parseInt(req.params.id)
	try {
		const data = await prisma.user.findUniqueOrThrow({
			where: {
				id: userId
			}
		})

		res.json({ msg: "Usuario obtenido con éxito", data })
	} catch (error) {
		res.json({ msg: "Error, no se pudo obtener el usuario", error })
		console.error(error)
	}
}

export const updateUser = async (req: Request, res: Response) => {
	const userId = parseInt(req.params.id)
	const updatedUser = req.body
	try {
		const data = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				email: updatedUser.email,
				password: updatedUser.password,
				role: updatedUser.role
			}
		})
		res.json({ msg: "Usuario actualizado con éxito", data })
	} catch (error: any) {
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "Error: El email ya está en uso", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error, no se pudo actualizar el usuario", error })
		}
	}
}

export const deleteUser = async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: parseInt(id)
			},
			include: {
				patient: true,
				provider: true
			}
		})

		if (!user) {
			return res.status(404).json({ error: "Usuario no encontrado" })
		}

		const { patient, provider } = user

		res.status(200).json({ patient, provider })

		await prisma.user.delete({
			where: {
				id: parseInt(id)
			},
			include: {
				patient: true,
				provider: true
			}
		})



		if (patient) {
			await prisma.patient.delete({
				where: {
					id: patient.id
				},
				include: {
					Appointment: true
				}
			})
		}

		if (provider) {
			await prisma.provider.delete({
				where: {
					id: provider.id
				},
				include: {
					Appointment: true
				}
			})
		}

		res.status(204).end()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Algo salio mal.." })
	}
}
