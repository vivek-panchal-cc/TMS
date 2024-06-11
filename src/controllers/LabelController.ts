import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Like } from "typeorm";
import { Label } from "../entity/Label";

export class LabelController {
  static async getAllLabels(req: Request, res: Response) {
    try {
      const { labelName } = req.body;
      const labelRepository = AppDataSource.getRepository(Label);
      const searchCriteria: any = { is_active: true };

      if (labelName) {
        searchCriteria.labelName = Like(`%${labelName}%`);
      }
      const labels = await labelRepository.find({ where: searchCriteria });

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Labels fetched successfully",
        labels,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch labels",
        error,
      });
    }
  }

  static async createLabel(req: Request, res: Response) {
    try {
      const { labelName, color } = req.body;
      const labelRepository = AppDataSource.getRepository(Label);
      const label = new Label();
      label.labelName = labelName;
      label.color = color;

      const existingLabel = await labelRepository.findOneBy({
        labelName,
        is_active: true,
      });

      if (existingLabel) {
        return res.status(400).json({
          status_code: 400,
          success: false,
          message: "Label already exists",
        });
      }

      if (req.user) {
        label.created_by = req.user;
      }

      await labelRepository.save(label);
      res.status(201).json({
        status_code: 201,
        success: true,
        message: "Label created successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create label",
        error: error,
      });
    }
  }

  static async getLabelById(req: Request, res: Response) {
    try {
      const labelId = req.params.id;
      const labelRepository = AppDataSource.getRepository(Label);
      const label = await labelRepository.findOneBy({
        id: labelId,
        is_active: true,
      });
      if (label) {
        res.status(200).json({
          status_code: 200,
          success: true,
          message: "Details fetched successfully",
          label,
        });
      } else {
        res.status(404).json({
          status_code: 404,
          success: false,
          message: "Label not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to fetch label",
        error: error,
      });
    }
  }

  static async updateLabel(req: Request, res: Response) {
    try {
      const labelId = req.params.id;
      const { labelName, color } = req.body;
      const labelRepository = AppDataSource.getRepository(Label);
      const label = await labelRepository.findOneBy({ id: labelId });

      if (!label) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Label not found",
        });
      }

      label.labelName = labelName;
      label.color = color;
      label.updated_at = new Date();

      if (req.user) {
        label.updated_by = req.user;
      }

      await labelRepository.save(label);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Label updated successfully",
        label,
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to update label",
        error: error,
      });
    }
  }

  static async deleteLabel(req: Request, res: Response) {
    try {
      const labelId = req.params.id;
      const labelRepository = AppDataSource.getRepository(Label);
      const label = await labelRepository.findOneBy({ id: labelId });

      if (!label) {
        return res.status(404).json({
          status_code: 404,
          success: false,
          message: "Label not found",
        });
      }

      //   await labelRepository.remove(label);
      label.is_active = false;
      label.updated_at = new Date();
      label.deleted_at = new Date();

      if (req.user) {
        label.updated_by = req.user;
      }

      await labelRepository.save(label);

      res.status(200).json({
        status_code: 200,
        success: true,
        message: "Label deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        status_code: 500,
        success: false,
        message: "Failed to delete label",
        error: error,
      });
    }
  }
}
