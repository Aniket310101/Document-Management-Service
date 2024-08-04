import AwsS3Provider from './aws-s3/aws-s3-provider';
import BaseDatastore from './datastore/base-datastore';

export default class ServiceBootrapper {
    async initialize() {
        await new BaseDatastore().initializeDB(); // DB initialize
        await new AwsS3Provider().initializeS3(); // AWS S3 Client initialize
    }
}