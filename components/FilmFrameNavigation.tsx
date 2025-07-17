'use client';

import { useAppStore } from '@/lib/store';
import { Loader, Palette, FileOutput, Zap, Film } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Tooltip, Button, Progress, Spinner } from 'flowbite-react';

const steps = [
	{
		id: 1,
		label: 'Import',
		icon: Loader,
		description: 'Load video file',
		color: 'blue',
		isLoading: false,
	},
	{
		id: 2,
		label: 'Select',
		icon: Film,
		description: 'Select frame extraction settings',
		color: 'purple',
	},
	{
		id: 3,
		label: 'Edit',
		icon: Palette,
		description: 'Configure layout and styling',
		color: 'pink',
	},
	{
		id: 4,
		label: 'Export',
		icon: FileOutput,
		description: 'Choose output format and generate contact sheet',
		color: 'green',
	},
];

export default function FilmFrameNavigation() {
	const {
		currentStep,
		stepsCompleted,
		videoMetadata,
		isAnalyzing,
		analysisError,
		setCurrentStep,
	} = useAppStore();

	const canAccessStep = (stepId: number) => {
		if (stepId === 1) return true;
		return videoMetadata !== null;
	};

	const getButtonColor = (step: any, isActive: boolean, isCompleted: boolean) => {
		if (isCompleted) return 'success';
		if (isActive) return step.color;
		return 'gray';
	};

	const getButtonOutline = (isActive: boolean, isCompleted: boolean) => {
		if (isCompleted) return false;
		if (isActive) return false;
		return true;
	};

	const getTooltipContent = (stepId: number) => {
		if (stepId === 1 && videoMetadata) {
			return (
				<div className="text-left">
					<div className="font-semibold mb-1">Video Info</div>
					<div>Duration: {formatDuration(videoMetadata.duration)}</div>
					<div>Frame Rate: {videoMetadata.fps.toFixed(2)} fps</div>
					<div>
						Resolution: {videoMetadata.width}x{videoMetadata.height}
					</div>
					<div>Codec: {videoMetadata.codec}</div>
				</div>
			);
		}
		return steps[stepId - 1].description;
	};

	const renderStepIcon = (step: any, isActive: boolean) => {
		// Show spinner or progress for load step when analyzing
		if (step.id === 1 && isAnalyzing) {
			return <Spinner size="sm" />;
		}

		const Icon = step.icon;
		return <Icon size={16} />;
	};

	return (
		<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-center">
					<div className="flex items-center gap-4">
						{steps.map((step, index) => {
							const isActive = currentStep === step.id;
							const isCompleted = stepsCompleted[step.id - 1];
							const canAccess = canAccessStep(step.id);

							return (
								<div key={step.id} className="flex items-center">
									<Tooltip
										content={getTooltipContent(step.id)}
										placement="bottom"
									>
										<div className="flex flex-col items-center">
											<Button
												color={getButtonColor(
													step,
													isActive,
													isCompleted
												)}
												outline={getButtonOutline(
													isActive,
													isCompleted
												)}
												size="sm"
												disabled={!canAccess}
												onClick={() =>
													canAccess && setCurrentStep(step.id)
												}
												className={`
                          min-w-[80px] h-12 flex flex-col items-center justify-center
                          ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                          ${isCompleted ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                          transition-all duration-200
                        `}
											>
												<div className="flex flex-col items-center gap-1">
													{renderStepIcon(step, isActive)}
													<span className="text-xs font-medium">
														{step.label}
													</span>
												</div>
											</Button>

											{/* Analysis progress indicator */}
											{step.id === 1 && isAnalyzing && (
												<div className="mt-2 w-full max-w-[80px]">
													<Progress
														progress={50}
														size="sm"
														color="blue"
													/>
												</div>
											)}
										</div>
									</Tooltip>

									{/* Step connector */}
									{index < steps.length - 1 && (
										<div className="flex items-center mx-4">
											<div
												className={`
                        w-8 h-0.5 transition-colors duration-200
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
											/>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
