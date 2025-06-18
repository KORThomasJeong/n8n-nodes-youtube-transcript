import {
	ApplicationError,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { Caption, Client } from 'youtubei';

export class YoutubeTranscriptNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Youtube Transcript',
		name: 'youtubeTranscriptNode',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:youTube.png',
		group: ['transform'],
		version: 1,
		description: 'Get Transcript of a youtube video',
		defaults: {
			name: 'Youtube Transcript',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Youtube Video ID or Url',
				name: 'youtubeId',
				type: 'string',
				default: '',
				placeholder: 'Youtube Video ID or Url',
			},
			{
				displayName: 'Preferred Caption Language',
				name: 'preferCapLang',
				type: 'string',
				default: 'en',
				placeholder: 'en, ko, jp...',
			},
			{
				displayName: 'Return Channel ID',
				name: 'returnChannelId',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Return Channel Name',
				name: 'returnChannelName',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Return Title',
				name: 'returnTitle',
				type: 'boolean',
				default: false,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const youtubeIdOrUrl = this.getNodeParameter('youtubeId', itemIndex, '') as string;
				const preferCapLang = this.getNodeParameter('preferCapLang', itemIndex, 'en') as string;
				const returnChannelId = this.getNodeParameter(
					'returnChannelId',
					itemIndex,
					false,
				) as boolean;
				const returnChannelName = this.getNodeParameter(
					'returnChannelName',
					itemIndex,
					false,
				) as boolean;
				const returnTitle = this.getNodeParameter('returnTitle', itemIndex, false) as boolean;

				let youtubeId = youtubeIdOrUrl;
				const urlRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;

				if (urlRegex.test(youtubeId)) {
					const url = new URL(youtubeId);

					if (url.hostname === 'youtu.be') {
						youtubeId = url.pathname.slice(1); // Extract the video ID from the path
					} else {
						const v = url.searchParams.get('v');
						if (!v) {
							throw new ApplicationError(
								`The provided URL doesn't contain a valid YouTube video identifier. URL: ${youtubeId}`,
							);
						}
						youtubeId = v;
					}
				}

				const youtube = new Client();
				const videoInfo = await youtube.getVideo(youtubeId);

				if (!videoInfo) {
					throw new NodeOperationError(this.getNode(), 'Failed to retrieve video information', {
						itemIndex,
					});
				}

				// 동영상에서 사용할 수 있는 자막 언어 리스트
				const availableCaptionLanguages = videoInfo.captions?.languages;

				let text = '';
				if (
					videoInfo.captions &&
					availableCaptionLanguages &&
					availableCaptionLanguages.length > 0
				) {
					try {
						let targetLangCode: string | undefined = undefined;

						// 1. preferCapLang 확인
						if (availableCaptionLanguages.some((lang) => lang.code === preferCapLang)) {
							targetLangCode = preferCapLang;
						}
						// 2. 영어 자막 확인
						else if (availableCaptionLanguages.some((lang) => lang.code === 'en')) {
							targetLangCode = 'en';
						}
						// 3. 사용 가능한 첫 번째 자막 사용
						else {
							targetLangCode = availableCaptionLanguages[0].code;
						}

						if (targetLangCode) {
							const captions: Caption[] | undefined = await videoInfo.captions.get(targetLangCode);
							if (captions && captions.length > 0) {
								text = captions.map((caption) => caption.text).join(' ');
							}
						}
					} catch (captionError: any) {
						console.error(
							`[Youtubei] Failed to extract transcript for language: ${captionError.message}`,
						);
						// 자막 추출에 실패해도 다른 정보는 계속 진행하도록 오류를 던지지 않음
					}
				}

				const output: { [key: string]: any } = {
					youtubeId: youtubeId,
				};

				if (text) {
					let cleanedTranscript = text.trim();
					// 1. 연속된 공백을 하나의 공백으로 변경
					cleanedTranscript = cleanedTranscript.replace(/\s+/g, ' ');
					// 2. 모든 쉼표 제거
					cleanedTranscript = cleanedTranscript.replace(/,/g, '');
					// 3. 줄 바꿈 문자를 공백으로 변경
					cleanedTranscript = cleanedTranscript.replace(/\n/g, ' ');
					// 4. 다시 한번 연속된 공백을 하나의 공백으로 변경 (쉼표 제거 후 생길 수 있는 이중 공백 처리)
					cleanedTranscript = cleanedTranscript.replace(/\s+/g, ' ');
					output.transcript = cleanedTranscript;
				}

				if (returnChannelId) output.channelId = videoInfo.channel?.id;
				if (returnChannelName) output.channelName = videoInfo.channel?.name;
				if (returnTitle) output.title = videoInfo.title;

				returnData.push({
					json: output,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
