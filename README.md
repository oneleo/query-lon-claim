# query-lon-claim

### Preparation

```shell
% npm install --global npm yarn@1 @graphprotocol/graph-cli
```

### Building

```shell
% yarn install
% yarn run codegen && yarn run build
```

### Testing

```shell
% yarn run test
```

### Deployment

```shell
% graph auth --studio <DEPLOY_KEY>
% graph deploy --studio <SUBGRAPH_SLUG>
```
