import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { profileValidation } from './profile.validation.js';
import { validate } from '../../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyId, profileCode, profileName]
 *             properties:
 *               companyId:
 *                 type: integer
 *                 example: 1
 *               profileCode:
 *                 type: string
 *                 example: PROF-ENG-01
 *               profileName:
 *                 type: string
 *                 example: Senior Software Engineer Profile
 *               jobTitle:
 *                 type: string
 *                 example: Lead Backend Developer
 *               department:
 *                 type: string
 *                 example: Engineering
 *               designation:
 *                 type: string
 *                 example: Senior Consultant
 *               jobLevel:
 *                 type: string
 *                 example: L4
 *               employmentType:
 *                 type: string
 *                 enum: [full_time, part_time, contract, intern, freelance]
 *                 example: full_time
 *               description:
 *                 type: string
 *                 example: Job description and role expectations
 *     responses:
 *       201:
 *         description: Profile created successfully
 */
router.post('/', validate(profileValidation.createProfile), profileController.createProfile);

/**
 * @swagger
 * /api/v1/profiles:
 *   get:
 *     summary: Get all active profiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Profiles list retrieved successfully
 */
router.get('/', profileController.getAllProfiles);

/**
 * @swagger
 * /api/v1/profiles/bulk-delete:
 *   post:
 *     summary: Bulk soft-delete multiple profiles
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               deletedRemarks:
 *                 type: string
 *                 example: Batch profile restructuring
 *     responses:
 *       200:
 *         description: Bulk delete result
 */
router.post('/bulk-delete', validate(profileValidation.bulkDelete), profileController.bulkDeleteProfiles);

/**
 * @swagger
 * /api/v1/profiles/{id}:
 *   get:
 *     summary: Get profile details by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile details retrieved successfully
 */
router.get('/:id', validate(profileValidation.getProfileById), profileController.getProfileById);

/**
 * @swagger
 * /api/v1/profiles/{id}:
 *   put:
 *     summary: Update profile details
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 example: Tech Lead
 *               designation:
 *                 type: string
 *                 example: Principal Engineer
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/:id', validate(profileValidation.updateProfile), profileController.updateProfile);

/**
 * @swagger
 * /api/v1/profiles/{id}:
 *   delete:
 *     summary: Soft-delete single profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deletedRemarks:
 *                 type: string
 *                 example: Profile position removed
 *     responses:
 *       200:
 *         description: Profile soft deleted successfully
 */
router.delete('/:id', validate(profileValidation.softDelete), profileController.softDeleteProfile);

export default router;
