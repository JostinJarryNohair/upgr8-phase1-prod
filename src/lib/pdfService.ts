import jsPDF from 'jspdf';
import { PlayerEvaluationWithScores } from '@/types/evaluation';

interface PDFOptions {
  language?: 'en' | 'fr';
  includeLogo?: boolean;
}

export class EvaluationPDFService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private language: 'en' | 'fr';

  constructor(options: PDFOptions = {}) {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.language = options.language || 'en';
  }

  private addText(text: string, x: number, y: number, fontSize: number = 12, fontStyle: string = 'normal') {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', fontStyle);
    this.doc.text(text, x, y);
  }

  private addLine(x1: number, y1: number, x2: number, y2: number) {
    this.doc.line(x1, y1, x2, y2);
  }

  private checkPageBreak(requiredSpace: number = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private getTranslations() {
    return {
      en: {
        title: 'PLAYER EVALUATION',
        player: 'Player',
        position: 'Position',
        date: 'Date',
        coach: 'Coach',
        overallScore: 'Overall Score',
        technicalSkills: 'TECHNICAL SKILLS',
        tacticalSkills: 'TACTICAL SKILLS',
        mentalSkills: 'MENTAL SKILLS',
        notes: 'Notes',
        outOf: 'out of',
        category: 'Category',
        score: 'Score',
      },
      fr: {
        title: 'ÉVALUATION DU JOUEUR',
        player: 'Joueur',
        position: 'Position',
        date: 'Date',
        coach: 'Entraîneur',
        overallScore: 'Score Global',
        technicalSkills: 'COMPÉTENCES TECHNIQUES',
        tacticalSkills: 'COMPÉTENCES TACTIQUES',
        mentalSkills: 'COMPÉTENCES MENTALES',
        notes: 'Notes',
        outOf: 'sur',
        category: 'Catégorie',
        score: 'Score',
      }
    }[this.language];
  }

  public generateEvaluationPDF(evaluation: PlayerEvaluationWithScores): jsPDF {
    const t = this.getTranslations();
    
    // Header
    this.addText(t.title, this.pageWidth / 2, this.currentY, 18, 'bold');
    this.currentY += 15;

    // Player Information
    this.addText(`${t.player}: ${evaluation.player.first_name} ${evaluation.player.last_name}`, this.margin, this.currentY);
    if (evaluation.player.jersey_number) {
      this.addText(`#${evaluation.player.jersey_number}`, this.pageWidth - this.margin, this.currentY, 12, 'normal');
    }
    this.currentY += 8;

    if (evaluation.player.position) {
      this.addText(`${t.position}: ${evaluation.player.position}`, this.margin, this.currentY);
      this.currentY += 8;
    }

    // Date and Coach
    if (evaluation.evaluation_date) {
      const date = new Date(evaluation.evaluation_date).toLocaleDateString(this.language === 'fr' ? 'fr-CA' : 'en-CA');
      this.addText(`${t.date}: ${date}`, this.margin, this.currentY);
      this.currentY += 8;
    }

    if (evaluation.coach.first_name && evaluation.coach.last_name) {
      this.addText(`${t.coach}: ${evaluation.coach.first_name} ${evaluation.coach.last_name}`, this.margin, this.currentY);
      this.currentY += 15;
    }

    // Overall Score
    if (evaluation.overall_score !== null) {
      this.addText(`${t.overallScore}: ${evaluation.overall_score}/10`, this.margin, this.currentY, 14, 'bold');
      this.currentY += 15;
    }

    // Separator line
    this.addLine(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;

    // Scores by Category
    const categories = {
      technical: evaluation.scores.filter(s => s.criteria.category === 'technical'),
      tactical: evaluation.scores.filter(s => s.criteria.category === 'tactical'),
      mental: evaluation.scores.filter(s => s.criteria.category === 'mental'),
    };

    // Technical Skills
    if (categories.technical.length > 0) {
      this.addText(t.technicalSkills, this.margin, this.currentY, 14, 'bold');
      this.currentY += 8;
      this.addScoresList(categories.technical);
      this.currentY += 5;
    }

    // Tactical Skills
    if (categories.tactical.length > 0) {
      this.checkPageBreak(20);
      this.addText(t.tacticalSkills, this.margin, this.currentY, 14, 'bold');
      this.currentY += 8;
      this.addScoresList(categories.tactical);
      this.currentY += 5;
    }

    // Mental Skills
    if (categories.mental.length > 0) {
      this.checkPageBreak(20);
      this.addText(t.mentalSkills, this.margin, this.currentY, 14, 'bold');
      this.currentY += 8;
      this.addScoresList(categories.mental);
      this.currentY += 5;
    }

    // Notes
    if (evaluation.notes) {
      this.checkPageBreak(30);
      this.addLine(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 10;
      this.addText(t.notes, this.margin, this.currentY, 12, 'bold');
      this.currentY += 8;
      this.addWrappedText(evaluation.notes, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
    }

    return this.doc;
  }

  private addScoresList(scores: Array<{ criteria: { name_fr: string; name_en: string; max_score: number | null }; score: number }>) {
    scores.forEach(score => {
      this.checkPageBreak(8);
      const criteriaName = this.language === 'fr' ? score.criteria.name_fr : score.criteria.name_en;
      this.addText(`• ${criteriaName}: ${score.score}/${score.criteria.max_score || 10}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    });
  }

  private addWrappedText(text: string, x: number, y: number, maxWidth: number) {
    const lines = this.doc.splitTextToSize(text, maxWidth);
    this.doc.text(lines, x, y);
    this.currentY += lines.length * 5;
  }

  public downloadPDF(evaluation: PlayerEvaluationWithScores, filename?: string): void {
    this.generateEvaluationPDF(evaluation);
    const defaultFilename = `evaluation_${evaluation.player.first_name}_${evaluation.player.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename || defaultFilename);
  }
}

// Convenience function
export function generateEvaluationPDF(evaluation: PlayerEvaluationWithScores, options: PDFOptions = {}): jsPDF {
  const service = new EvaluationPDFService(options);
  return service.generateEvaluationPDF(evaluation);
}

export function downloadEvaluationPDF(evaluation: PlayerEvaluationWithScores, options: PDFOptions = {}): void {
  const service = new EvaluationPDFService(options);
  service.downloadPDF(evaluation);
} 