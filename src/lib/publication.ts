import { recipes } from '../data/recipes';
import { releaseReview } from '../data/release';

export const releaseReady = releaseReview.financialModelApproved
  && releaseReview.publicAssetsApproved
  && Boolean(releaseReview.reviewRecord)
  && recipes.every((recipe) => recipe.verified && recipe.translationsReviewed
    && recipe.steps.every((step) => step.evidence.length > 0)
    && Boolean(recipe.outputEvidence?.length));
