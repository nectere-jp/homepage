export const sportAnimationStyles = `
  @keyframes sportFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes sportFadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  @keyframes sportImageFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes sportImageFadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }
  .sport-text-enter {
    animation: sportFadeIn 0.5s ease-out forwards;
  }
  .sport-text-exit {
    animation: sportFadeOut 0.5s ease-out forwards;
  }
  .sport-image-enter {
    animation: sportImageFadeIn 0.5s ease-out forwards;
  }
  .sport-image-exit {
    animation: sportImageFadeOut 0.5s ease-out forwards;
  }
`;
