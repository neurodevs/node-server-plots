import sharp from 'sharp'

export default function fakeSharp(options?: sharp.SharpOptions) {
    FakeSharpTracker.sharpCalls.push(options)

    const instance: sharp.Sharp = sharp(options)

    instance.composite = (images: sharp.OverlayOptions[]): sharp.Sharp => {
        FakeSharpTracker.compositeCalls.push(images)
        return {} as sharp.Sharp
    }

    // @ts-ignore
    instance.toFile = async (fileOut: string): Promise<sharp.OutputInfo> => {
        FakeSharpTracker.toFileCalls.push(fileOut)
        return {} as sharp.OutputInfo
    }

    return instance
}

export class FakeSharpTracker {
    public static sharpCalls: (sharp.SharpOptions | undefined)[] = []
    public static compositeCalls: sharp.OverlayOptions[][] = []
    public static toFileCalls: string[] = []
}
